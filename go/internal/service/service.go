// Package service owns the conversion lifecycle: intake, the bounded worker
// pool, per-job cancellation, progress fan-out and ephemeral artifact pruning.
package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/TenOFSwordsr/eliverter/internal/accel"
	"github.com/TenOFSwordsr/eliverter/internal/hub"
	"github.com/TenOFSwordsr/eliverter/internal/pipeline"
	"github.com/TenOFSwordsr/eliverter/internal/registry"
	"github.com/TenOFSwordsr/eliverter/internal/store"
)

// Config wires a Service to its on-disk layout.
type Config struct {
	WorkDir   string // uploads
	OutDir    string // finished artifacts
	DBPath    string
	NativeDir string // Android native lib dir holding libffmpeg_cli.so, else ""
	// Workers caps concurrent encodes. Zero picks a conservative default.
	Workers int
	// PruneInterval and MaxArtifactAge drive the background cleaner.
	PruneInterval  time.Duration
	MaxArtifactAge time.Duration
}

// Service is the application core, shared by the HTTP server and the Android
// .so entry point.
type Service struct {
	cfg    Config
	db     *store.DB
	reg    *registry.Registry
	engine *pipeline.Engine
	hub    *hub.Hub

	queue    chan task
	workers  int
	cancels  sync.Map // job id -> context.CancelFunc
	wg       sync.WaitGroup
	shutdown chan struct{}
}

type task struct {
	jobID string
	req   *pipeline.Request // convert tasks only
	input string            // sticker tasks: engine builds the request
	erase *pipeline.Erase   // sticker tasks: background keying, if asked for
	kind  taskKind
	pack  pipeline.PackID
}

type taskKind int

const (
	taskConvert taskKind = iota
	taskSticker
)

// New opens the database, resolves FFmpeg and starts the pool.
func New(ctx context.Context, cfg Config) (*Service, error) {
	if cfg.WorkDir == "" || cfg.OutDir == "" {
		return nil, errors.New("service: WorkDir and OutDir are required")
	}
	for _, d := range []string{cfg.WorkDir, cfg.OutDir, filepath.Dir(cfg.DBPath)} {
		if err := os.MkdirAll(d, 0o755); err != nil {
			return nil, fmt.Errorf("service: %s: %w", d, err)
		}
	}
	bin, err := pipeline.DiscoverBinaries(cfg.NativeDir)
	if err != nil {
		return nil, err
	}
	reg := registry.New()
	engine, err := pipeline.NewEngine(ctx, bin, reg)
	if err != nil {
		return nil, err
	}
	db, err := store.Open(cfg.DBPath)
	if err != nil {
		return nil, err
	}
	workers := cfg.Workers
	if workers <= 0 {
		// Half the logical cores, at least one: FFmpeg saturates memory
		// bandwidth, and the point of the cap is not to throttle the host.
		workers = runtime.NumCPU() / 2
		if workers < 1 {
			workers = 1
		}
	}
	if workers > 4 {
		workers = 4
	}
	s := &Service{
		cfg: cfg, db: db, reg: reg, engine: engine, hub: hub.New(),
		queue:    make(chan task, 256),
		workers:  workers,
		shutdown: make(chan struct{}),
	}
	for i := 0; i < workers; i++ {
		s.wg.Add(1)
		go s.worker(i)
	}
	s.wg.Add(1)
	go s.pruner()
	return s, nil
}

// Info about the runtime, surfaced on /api/health.
func (s *Service) Info() map[string]any {
	return map[string]any{
		"ffmpeg_version": s.engine.Caps.Version,
		"simd_backend":   accel.Backend(),
		"workers":        s.workers,
		"gomaxprocs":     runtime.GOMAXPROCS(0),
		"registry":       s.reg.Counts(),
		"encoders":       len(s.engine.Caps.Encoders),
		"decoders":       len(s.engine.Caps.Decoders),
		"muxers":         len(s.engine.Caps.Muxers),
		"ws_clients":     s.hub.Clients(),
	}
}

// Registry exposes the taxonomy to the HTTP layer.
func (s *Service) Registry() *registry.Registry { return s.reg }

// Hub exposes the event stream to the HTTP layer.
func (s *Service) Hub() *hub.Hub { return s.hub }

// Engine exposes the FFmpeg pipeline to the HTTP layer.
func (s *Service) Engine() *pipeline.Engine { return s.engine }

// DB exposes the persisted store to the HTTP layer.
func (s *Service) DB() *store.DB { return s.db }

// OutDir is where finished artifacts are written.
func (s *Service) OutDir() string { return s.cfg.OutDir }

// WorkDir is where uploads land before processing.
func (s *Service) WorkDir() string { return s.cfg.WorkDir }

// ---------------------------------------------------------------------------
// Intake
// ---------------------------------------------------------------------------

// SaveUpload writes a multipart payload into the work dir, returning the path.
// The filename is sanitised: uploads come from a phone and may contain any
// character the user's file manager produced.
func (s *Service) SaveUpload(jobID, filename string, src io.Reader) (string, int64, error) {
	ext := registry.NormalizeExt(filename)
	dest := filepath.Join(s.cfg.WorkDir, jobID+ext)
	f, err := os.Create(dest)
	if err != nil {
		return "", 0, err
	}
	defer f.Close()
	n, err := io.Copy(f, src)
	if err != nil {
		os.Remove(dest)
		return "", 0, err
	}
	return dest, n, nil
}

// SubmitConvert records a job and queues it.
func (s *Service) SubmitConvert(ctx context.Context, j *store.Job, req *pipeline.Request) error {
	if err := s.db.CreateJob(ctx, j); err != nil {
		return err
	}
	return s.enqueue(ctx, j.ID, task{jobID: j.ID, req: req, kind: taskConvert})
}

// SubmitSticker queues a ready-pack render. The engine derives the pack's own
// geometry and output name, so only the input path travels with the task.
func (s *Service) SubmitSticker(ctx context.Context, j *store.Job, input string, pack pipeline.PackID,
	erase *pipeline.Erase) error {
	if err := s.db.CreateJob(ctx, j); err != nil {
		return err
	}
	return s.enqueue(ctx, j.ID, task{jobID: j.ID, input: input, erase: erase, kind: taskSticker, pack: pack})
}

func (s *Service) enqueue(ctx context.Context, jobID string, t task) error {
	s.publish(hub.Event{Type: "queued", JobID: jobID, Phase: "queued", Message: "queued"})
	select {
	case s.queue <- t:
		return nil
	case <-s.shutdown:
		return errors.New("service: shutting down")
	case <-ctx.Done():
		return ctx.Err()
	}
}

// Cancel stops a running job.
func (s *Service) Cancel(jobID string) bool {
	v, ok := s.cancels.Load(jobID)
	if !ok {
		return false
	}
	v.(context.CancelFunc)()
	return true
}

// Shutdown drains the pool and closes the database.
func (s *Service) Shutdown() {
	close(s.shutdown)
	s.wg.Wait()
	_ = s.db.Close()
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

func (s *Service) worker(id int) {
	defer s.wg.Done()
	for {
		select {
		case <-s.shutdown:
			return
		case t := <-s.queue:
			s.run(t, id)
		}
	}
}

func (s *Service) run(t task, workerID int) {
	ctx, cancel := context.WithCancel(context.Background())
	s.cancels.Store(t.jobID, cancel)
	defer func() {
		cancel()
		s.cancels.Delete(t.jobID)
	}()

	_ = s.db.SetProgress(ctx, t.jobID, store.StatusProcessing, 0)
	s.publish(hub.Event{Type: "started", JobID: t.jobID, Phase: "processing"})

	emit := func(p pipeline.Progress) {
		if p.Pct > 99.5 {
			p.Pct = 99.5
		}
		s.publish(hub.Event{
			Type: "progress", JobID: t.jobID, Pct: p.Pct, Frame: p.Frame,
			OutTimeMs: p.OutTimeMs, Speed: p.Speed, SizeBytes: p.SizeBytes, Phase: p.Phase,
		})
	}

	switch t.kind {
	case taskSticker:
		res, err := s.engine.Sticker(ctx, t.input, t.pack, s.cfg.OutDir, t.erase, emit)
		if err != nil {
			s.fail(ctx, t.jobID, err)
			return
		}
		s.complete(ctx, t.jobID, res.OutputPath, res.SizeBytes, res)
	default:
		if _, err := s.engine.Convert(ctx, t.req, emit); err != nil {
			s.fail(ctx, t.jobID, err)
			return
		}
		size := pipeline.SizeOnDisk(t.req.Output)
		s.complete(ctx, t.jobID, t.req.Output, size, nil)
	}

	// Sticker tasks carry no Request, so reading t.req here would nil-panic -
	// and a panic in a worker goroutine takes down the whole process, not just
	// the request.
	input := t.input
	if input == "" && t.req != nil {
		input = t.req.Input
	}
	s.emitWaveform(ctx, input, t.jobID)
}

func (s *Service) complete(ctx context.Context, jobID, outPath string, size int64, payload any) {
	if err := s.db.Finish(ctx, jobID, store.StatusCompleted, size, outPath, ""); err != nil {
		log.Printf("service: finish %s: %v", jobID, err)
	}
	s.publish(hub.Event{Type: "complete", JobID: jobID, Pct: 100, Phase: "done",
		SizeBytes: size, Payload: payload})
}

func (s *Service) fail(ctx context.Context, jobID string, err error) {
	msg := err.Error()
	if strings.Contains(msg, "context canceled") {
		msg = "cancelled"
	}
	_ = s.db.Finish(ctx, jobID, store.StatusFailed, 0, "", msg)
	s.publish(hub.Event{Type: "error", JobID: jobID, Phase: "failed", Message: msg})
}

func (s *Service) publish(ev hub.Event) { s.hub.Broadcast(ev) }

// emitWaveform decodes the source to mono PCM and pushes reduced peaks, which
// is what the pastel audio visualiser draws.
func (s *Service) emitWaveform(ctx context.Context, input, jobID string) {
	if input == "" {
		return
	}
	peaks, err := s.Waveform(ctx, input, 100)
	if err != nil || len(peaks) == 0 {
		return
	}
	s.publish(hub.Event{Type: "waveform", JobID: jobID, Peaks: peaks})
}

// Waveform returns up to `buckets` peak levels for the audio track of input.
func (s *Service) Waveform(ctx context.Context, input string, buckets int) ([]float32, error) {
	peaks, _, err := s.engine.Peaks(ctx, input, buckets)
	return peaks, err
}

// ---------------------------------------------------------------------------
// Pruning
// ---------------------------------------------------------------------------

func (s *Service) pruner() {
	defer s.wg.Done()
	interval := s.cfg.PruneInterval
	if interval <= 0 {
		interval = 30 * time.Minute
	}
	age := s.cfg.MaxArtifactAge
	if age <= 0 {
		age = 2 * time.Hour
	}
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-s.shutdown:
			return
		case <-t.C:
			n, err := s.pruneOnce(age)
			if err != nil {
				log.Printf("service: prune: %v", err)
				continue
			}
			if n > 0 {
				s.publish(hub.Event{Type: "pruned", Message: strconv.FormatInt(n, 10) + " artifacts removed"})
			}
		}
	}
}

func (s *Service) pruneOnce(age time.Duration) (int64, error) {
	var removed int64
	// Each location is pruned independently: an unreadable work dir should not
	// stop expired outputs from being reclaimed.
	n, err := pruneDir(s.cfg.WorkDir, age)
	removed += n
	if err != nil {
		log.Printf("service: prune %s: %v", s.cfg.WorkDir, err)
	}
	n, err = pruneDir(s.cfg.OutDir, age)
	removed += n
	if err != nil {
		log.Printf("service: prune %s: %v", s.cfg.OutDir, err)
	}
	dbRemoved, err := s.db.PurgeOlderThan(context.Background(), age)
	removed += dbRemoved
	return removed, err
}

func pruneDir(dir string, age time.Duration) (int64, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return 0, err
	}
	var removed int64
	cutoff := time.Now().Add(-age)
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		info, err := e.Info()
		if err != nil || info.ModTime().After(cutoff) {
			continue
		}
		if err := os.Remove(filepath.Join(dir, e.Name())); err == nil {
			removed++
		}
	}
	return removed, nil
}
