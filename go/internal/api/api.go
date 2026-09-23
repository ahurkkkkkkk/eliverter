// Package api exposes the service over HTTP: REST for intake and results,
// WebSocket for live transcoding milestones, and the built frontend as static
// assets so the Android WebView has one origin to load.
package api

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/TenOFSwordsr/eliverter/internal/pipeline"
	"github.com/TenOFSwordsr/eliverter/internal/registry"
	"github.com/TenOFSwordsr/eliverter/internal/service"
	"github.com/TenOFSwordsr/eliverter/internal/store"
	"github.com/TenOFSwordsr/eliverter/internal/webui"
)

// maxUpload bounds a single intake. A phone converting a 4K clip should get a
// clear rejection, not an out-of-memory kill.
const maxUpload = 4 << 30

// Server binds routes to a Service.
type Server struct {
	svc *service.Service
	reg *registry.Registry
}

// New builds the Gin engine.
func New(svc *service.Service) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery(), requestLog())
	r.MaxMultipartMemory = 32 << 20

	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(o string) bool {
			// The WebView reports null/asset origins; the dev server is localhost.
			return o == "" || strings.HasPrefix(o, "http://localhost") ||
				strings.HasPrefix(o, "http://127.0.0.1") || o == "null" ||
				strings.HasPrefix(o, "http://[::1]")
		},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		AllowCredentials: false,
	}))

	a := &Server{svc: svc, reg: svc.Registry()}

	r.GET("/api/health", a.health)
	r.GET("/api/taxonomy", a.taxonomy)
	r.GET("/api/packs", a.packs)

	r.POST("/api/probe", a.probe)
	r.POST("/api/jobs", a.createJob)
	r.GET("/api/jobs", a.listJobs)
	r.GET("/api/jobs/:id", a.getJob)
	r.DELETE("/api/jobs/:id", a.cancelJob)
	r.GET("/api/jobs/:id/download", a.download)
	r.GET("/api/jobs/:id/waveform", a.waveform)

	r.POST("/api/sticker-packs", a.createStickerPack)

	r.GET("/api/presets", a.listPresets)
	r.POST("/api/presets", a.putPreset)
	r.DELETE("/api/presets/:id", a.deletePreset)

	r.GET("/ws/jobs", func(c *gin.Context) { svc.Hub().ServeWS(c.Writer, c.Request) })

	webui.Mount(r)
	return r
}

func requestLog() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		if c.Request.URL.Path == "/ws/jobs" {
			return
		}
		fmt.Printf("eliverter %s %s %d %s\n", c.Request.Method, c.Request.URL.Path,
			c.Writer.Status(), time.Since(start).Round(time.Millisecond))
	}
}

// ---------------------------------------------------------------------------

func (a *Server) health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"ok": true, "app": "eliverter", "runtime": a.svc.Info(),
		"time": time.Now().UTC().Format(time.RFC3339),
	})
}

func (a *Server) taxonomy(c *gin.Context) {
	kind := registry.Kind(c.Query("kind"))
	out := gin.H{
		"containers":    a.reg.Containers(),
		"codecs":        a.reg.Codecs(),
		"pixel_formats": a.reg.PixelFormats(),
		"counts":        a.reg.Counts(),
		"available":     a.svc.Info(),
	}
	if kind != "" {
		out["targets"] = a.reg.TargetsForKind(kind)
	}
	c.JSON(http.StatusOK, out)
}

func (a *Server) packs(c *gin.Context) {
	list := pipeline.ListPacks()
	type view struct {
		ID         string  `json:"id"`
		Label      string  `json:"label"`
		Container  string  `json:"container"`
		Codec      string  `json:"codec"`
		Edge       int     `json:"edge"`
		Square     bool    `json:"square"`
		FPS        float64 `json:"fps"`
		MaxSecs    float64 `json:"max_duration_seconds"`
		LimitBytes int64   `json:"limit_bytes"`
		LimitHuman string  `json:"limit"`
		Notes      string  `json:"notes"`
	}
	views := make([]view, 0, len(list))
	for _, p := range list {
		views = append(views, view{
			ID: string(p.ID), Label: p.Label, Container: p.Container, Codec: p.VideoCodec,
			Edge: p.Edge, Square: p.Square, FPS: p.FPS, MaxSecs: p.MaxDuration,
			LimitBytes: p.LimitBytes, LimitHuman: humanBytes(p.LimitBytes), Notes: p.Notes,
		})
	}
	c.JSON(http.StatusOK, views)
}

// ---------------------------------------------------------------------------

// uploadedFile pulls the multipart part and stores it in the work dir.
func (a *Server) uploadedFile(c *gin.Context, jobID string) (string, string, int64, error) {
	fh, err := c.FormFile("file")
	if err != nil {
		return "", "", 0, fmt.Errorf("a file field is required: %w", err)
	}
	src, err := fh.Open()
	if err != nil {
		return "", "", 0, err
	}
	defer src.Close()
	path, size, err := a.svc.SaveUpload(jobID, fh.Filename, src)
	if err != nil {
		return "", "", 0, err
	}
	return path, fh.Filename, size, nil
}

func (a *Server) probe(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUpload)
	id := newID()
	path, name, _, err := a.uploadedFile(c, id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	defer os.Remove(path)

	info, err := a.svc.Engine().ProbeAndResolve(c.Request.Context(), path)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error": err.Error(), "filename": name, "recognised": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"filename": name, "recognised": true, "info": info})
}

type jobForm struct {
	TargetContainer  string  `form:"target_format" json:"target_format"`
	VideoCodec       string  `form:"video_codec" json:"video_codec"`
	AudioCodec       string  `form:"audio_codec" json:"audio_codec"`
	PresetID         string  `form:"preset_id" json:"preset_id"`
	StreamCopy       bool    `form:"stream_copy" json:"stream_copy"`
	NoVideo          bool    `form:"no_video" json:"no_video"`
	NoAudio          bool    `form:"no_audio" json:"no_audio"`
	Width            int     `form:"width" json:"width"`
	Height           int     `form:"height" json:"height"`
	FPS              float64 `form:"fps" json:"fps"`
	CRF              int     `form:"crf" json:"crf"`
	BitrateKbps      int     `form:"bitrate_kbps" json:"bitrate_kbps"`
	TwoPass          bool    `form:"two_pass" json:"two_pass"`
	PixelFormat      string  `form:"pixel_format" json:"pixel_format"`
	AudioBitrateKbps int     `form:"audio_bitrate_kbps" json:"audio_bitrate_kbps"`
	SampleRate       int     `form:"sample_rate" json:"sample_rate"`
	Channels         int     `form:"channels" json:"channels"`
	StartTime        float64 `form:"start" json:"start"`
	Duration         float64 `form:"duration" json:"duration"`
	CustomFilters    string  `form:"filters" json:"filters"`
	StripMetadata    bool    `form:"strip_metadata" json:"strip_metadata"`
	eraseForm
}

// eraseForm is embedded in jobForm and bound on its own by the pack endpoint,
// which otherwise carries nothing but a pack id.
type eraseForm struct {
	EraseBackground bool    `form:"erase_background" json:"erase_background"`
	EraseMode       string  `form:"erase_mode" json:"erase_mode"`
	KeyColor        string  `form:"key_color" json:"key_color"`
	Similarity      float64 `form:"similarity" json:"similarity"`
	Blend           float64 `form:"blend" json:"blend"`
	Despill         bool    `form:"despill" json:"despill"`
}

func (f eraseForm) erase() *pipeline.Erase {
	if !f.EraseBackground {
		return nil
	}
	return &pipeline.Erase{
		Mode: f.EraseMode, Color: f.KeyColor,
		Similarity: f.Similarity, Blend: f.Blend, Despill: f.Despill,
	}
}

// bindJob accepts either multipart form fields or a JSON body, so the WebView
// can upload and configure in one request while scripted clients use JSON.
func (a *Server) bindJob(c *gin.Context, form *jobForm) error {
	return a.bindForm(c, form)
}

// bindForm accepts either multipart form fields or a JSON body.
func (a *Server) bindForm(c *gin.Context, form any) error {
	if strings.HasPrefix(c.Request.Header.Get("Content-Type"), "multipart/") {
		return c.ShouldBind(form)
	}
	return c.ShouldBindJSON(form)
}

func (a *Server) createJob(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUpload)

	var form jobForm
	if err := a.bindJob(c, &form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if form.TargetContainer == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target_format is required"})
		return
	}

	jobID := newID()
	srcPath, filename, _, err := a.uploadedFile(c, jobID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx := c.Request.Context()
	info, err := a.svc.Engine().ProbeAndResolve(ctx, srcPath)
	if err != nil {
		os.Remove(srcPath)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error(), "filename": filename})
		return
	}

	ext := "." + strings.TrimPrefix(strings.ToLower(form.TargetContainer), ".")
	if c, ok := a.reg.ContainerByKey(form.TargetContainer); ok && len(c.Extensions) > 0 {
		ext = c.Extensions[0]
	}
	outPath := filepath.Join(a.svc.OutDir(), jobID+ext)

	req := &pipeline.Request{
		Input: srcPath, Output: outPath,
		TargetContainer: form.TargetContainer, VideoCodec: form.VideoCodec,
		AudioCodec: form.AudioCodec, StreamCopy: form.StreamCopy,
		NoVideo: form.NoVideo, NoAudio: form.NoAudio,
		Width: form.Width, Height: form.Height, FPS: form.FPS,
		CRF: form.CRF, BitrateKbps: form.BitrateKbps, TwoPass: form.TwoPass,
		PixelFormat: form.PixelFormat, AudioBitrateKbps: form.AudioBitrateKbps,
		SampleRate: form.SampleRate, Channels: form.Channels,
		StartTime: form.StartTime, Duration: form.Duration,
		CustomFilters: form.CustomFilters, StripMetadata: form.StripMetadata,
		KeepPixels: pipeline.IsPixelArt(info),
	}
	req.Erase = form.erase()

	// A preset fills anything the request left unset rather than overriding it.
	if form.PresetID != "" {
		if p, err := a.svc.DB().GetPreset(ctx, form.PresetID); err == nil {
			applyPreset(req, p, a.reg)
		}
	}

	// Resolving the key colour means decoding a frame, so it happens here rather
	// than inside BuildPlan: an upload whose background cannot be keyed is rejected
	// with 422 instead of being queued to fail later.
	if err := a.svc.Engine().PrepareErase(ctx, req); err != nil {
		os.Remove(srcPath)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	if _, err := a.svc.Engine().BuildPlan(req, info); err != nil {
		os.Remove(srcPath)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}

	job := &store.Job{
		ID: jobID, SourceFilename: filename,
		SourceFormat: info.Format.FormatName, TargetFormat: form.TargetContainer,
		Status: store.StatusQueued, SourcePath: srcPath, OutputPath: outPath,
		PresetID: form.PresetID,
	}
	if err := a.svc.SubmitConvert(ctx, job, req); err != nil {
		os.Remove(srcPath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusAccepted, jobView(job))
}

func (a *Server) createStickerPack(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxUpload)

	packID := c.PostForm("pack")
	if packID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "pack is required",
			"allowed": packIDs(pipeline.ListPacks())})
		return
	}
	pack, err := pipeline.LookupPack(packID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error(), "allowed": packIDs(pipeline.ListPacks())})
		return
	}

	// A sprite cut out of a clip is the point of keying, so the pack endpoint takes
	// the same erase options as a plain conversion.
	var form eraseForm
	if err := a.bindForm(c, &form); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	erase := form.erase()

	jobID := newID()
	srcPath, filename, _, err := a.uploadedFile(c, jobID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx := c.Request.Context()
	info, err := a.svc.Engine().ProbeAndResolve(ctx, srcPath)
	if err != nil {
		os.Remove(srcPath)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error(), "filename": filename})
		return
	}

	// The engine owns pack geometry; validate against the pack rules only.
	if err := a.svc.Engine().ValidatePack(ctx, srcPath, pack.ID, erase); err != nil {
		os.Remove(srcPath)
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error(), "filename": filename})
		return
	}

	job := &store.Job{ID: jobID, SourceFilename: filename,
		SourceFormat: info.Format.FormatName, TargetFormat: string(pack.ID),
		Status: store.StatusQueued, SourcePath: srcPath}
	if err := a.svc.SubmitSticker(ctx, job, srcPath, pack.ID, erase); err != nil {
		os.Remove(srcPath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusAccepted, jobView(job))
}

func (a *Server) listJobs(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	jobs, err := a.svc.DB().ListJobs(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	views := make([]gin.H, 0, len(jobs))
	for _, j := range jobs {
		views = append(views, jobView(j))
	}
	c.JSON(http.StatusOK, gin.H{"jobs": views, "total": len(views)})
}

func (a *Server) getJob(c *gin.Context) {
	j, err := a.svc.DB().GetJob(c.Request.Context(), c.Param("id"))
	if errors.Is(err, store.ErrNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "no such job"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jobView(j))
}

func (a *Server) cancelJob(c *gin.Context) {
	id := c.Param("id")
	if !a.svc.Cancel(id) {
		c.JSON(http.StatusConflict, gin.H{"error": "job is not running"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"cancelled": id})
}

func (a *Server) download(c *gin.Context) {
	j, err := a.svc.DB().GetJob(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no such job"})
		return
	}
	if j.OutputPath == "" {
		c.JSON(http.StatusConflict, gin.H{"error": "job has not produced an output yet"})
		return
	}
	// ServeFile owns Content-Length, Range and the sendfile path; streaming by
	// hand here would report a zero-length body to the WebView's downloader.
	name := strings.TrimSuffix(j.SourceFilename, filepath.Ext(j.SourceFilename)) +
		filepath.Ext(j.OutputPath)
	c.Header("Content-Disposition", safeDisposition(name))
	c.Header("Cache-Control", "no-store")
	c.File(j.OutputPath)
}

func (a *Server) waveform(c *gin.Context) {
	j, err := a.svc.DB().GetJob(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no such job"})
		return
	}
	buckets, _ := strconv.Atoi(c.DefaultQuery("buckets", "100"))
	src := j.SourcePath
	if _, err := os.Stat(src); err != nil && j.OutputPath != "" {
		src = j.OutputPath
	}
	peaks, err := a.svc.Waveform(c.Request.Context(), src, buckets)
	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"buckets": len(peaks), "peaks": peaks})
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

func (a *Server) listPresets(c *gin.Context) {
	ps, err := a.svc.DB().ListPresets(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"presets": ps})
}

func (a *Server) putPreset(c *gin.Context) {
	var p store.Preset
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if strings.TrimSpace(p.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "preset name is required"})
		return
	}
	if p.ID == "" {
		p.ID = newID()
	}
	if err := a.svc.DB().PutPreset(c.Request.Context(), &p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (a *Server) deletePreset(c *gin.Context) {
	if err := a.svc.DB().DeletePreset(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no such preset"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": c.Param("id")})
}

// ---------------------------------------------------------------------------

func applyPreset(req *pipeline.Request, p *store.Preset, reg *registry.Registry) {
	if req.TargetContainer == "" && p.TargetExt != "" {
		if c, ok := reg.ContainerForExtension(p.TargetExt); ok {
			req.TargetContainer = c.Key
		}
	}
	if req.VideoCodec == "" {
		req.VideoCodec = p.VideoCodec
	}
	if req.AudioCodec == "" {
		req.AudioCodec = p.AudioCodec
	}
	if req.CustomFilters == "" {
		req.CustomFilters = p.CustomFilters
	}
}

func jobView(j *store.Job) gin.H {
	return gin.H{
		"id": j.ID, "source_filename": j.SourceFilename,
		"source_format": j.SourceFormat, "target_format": j.TargetFormat,
		"status": j.Status, "progress_pct": j.ProgressPct,
		"output_size": j.OutputSize, "error": j.ErrorMessage,
		"preset_id":    j.PresetID,
		"created_at":   j.CreatedAt.UTC().Format(time.RFC3339),
		"completed_at": utcOrEmpty(j.CompletedAt),
		"download_url": "/api/jobs/" + j.ID + "/download",
	}
}

func utcOrEmpty(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.UTC().Format(time.RFC3339)
}

func packIDs(ps []pipeline.Pack) []string {
	out := make([]string, 0, len(ps))
	for _, p := range ps {
		out = append(out, string(p.ID))
	}
	return out
}

// newID returns a filesystem-safe opaque identifier.
func newID() string {
	var b [12]byte
	if _, err := rand.Read(b[:]); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 36)
	}
	return hex.EncodeToString(b[:])
}

// safeDisposition strips characters that would break out of the header.
func safeDisposition(name string) string {
	var b strings.Builder
	b.WriteString(`attachment; filename="`)
	for _, r := range name {
		switch {
		case r == '"', r == '\\', r == '\n', r == '\r', r == ';':
			b.WriteByte('_')
		case r < 0x20 || r > 0x7e:
			b.WriteByte('_')
		default:
			b.WriteRune(r)
		}
	}
	b.WriteString(`"`)
	return b.String()
}

func humanBytes(n int64) string {
	switch {
	case n >= 1<<20:
		return trimFloat(float64(n)/(1<<20)) + " MB"
	case n >= 1<<10:
		return trimFloat(float64(n)/(1<<10)) + " KB"
	}
	return strconv.FormatInt(n, 10) + " B"
}

func trimFloat(f float64) string {
	return strings.TrimRight(strings.TrimRight(fmt.Sprintf("%.2f", f), "0"), ".")
}
