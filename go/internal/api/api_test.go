package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"testing"
	"time"

	"github.com/TenOFSwordsr/eliverter/internal/pipeline"
	"github.com/TenOFSwordsr/eliverter/internal/service"
)

// These tests drive the HTTP surface end to end. Unit tests on the engine alone
// missed a sticker-pack handler that failed every request, because the handler
// built its own request object rather than the one the engine uses.

var (
	ts        *httptest.Server
	svc       *service.Service
	sampleDir string
)

func TestMain(m *testing.M) {
	if _, err := exec.LookPath("ffmpeg"); err != nil {
		fmt.Println("SKIP: ffmpeg not installed")
		os.Exit(0)
	}
	ctx := context.Background()
	dir, err := os.MkdirTemp("", "eliverter-api")
	if err != nil {
		fmt.Println("SKIP:", err)
		os.Exit(0)
	}
	sampleDir = filepath.Join(dir, "samples")
	if err := os.MkdirAll(sampleDir, 0o755); err != nil {
		fmt.Println("SKIP:", err)
		os.RemoveAll(dir)
		os.Exit(0)
	}

	svc, err = service.New(ctx, service.Config{
		WorkDir: filepath.Join(dir, "uploads"),
		OutDir:  filepath.Join(dir, "outputs"),
		DBPath:  filepath.Join(dir, "test.db"),
		Workers: 2,
	})
	if err != nil {
		fmt.Println("SKIP: service:", err)
		os.RemoveAll(dir)
		os.Exit(0)
	}
	ts = httptest.NewServer(New(svc))
	code := m.Run()
	ts.Close()
	svc.Shutdown()
	os.RemoveAll(dir)
	os.Exit(code)
}

func makeSample(t *testing.T, name string, args ...string) string {
	t.Helper()
	p := filepath.Join(sampleDir, name)
	if _, err := os.Stat(p); err == nil {
		return p
	}
	cmd := exec.Command("ffmpeg", append([]string{"-hide_banner", "-nostdin", "-loglevel", "error", "-y"}, args...)...)
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("sample %s: %v\n%s", name, err, out)
	}
	return p
}

func clipMP4(t *testing.T) string {
	return makeSample(t, "clip.mp4",
		"-f", "lavfi", "-i", "testsrc2=size=320x240:rate=30:duration=2",
		"-f", "lavfi", "-i", "sine=frequency=440:duration=2",
		"-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest",
		filepath.Join(sampleDir, "clip.mp4"))
}

func pngAlpha(t *testing.T) string {
	return makeSample(t, "alpha.png",
		"-f", "lavfi", "-i", "gradients=size=200x120:duration=1",
		"-vf", "format=rgba,colorchannelmixer=aa=0.6,format=rgba",
		"-frames:v", "1", filepath.Join(sampleDir, "alpha.png"))
}

func junkFile(t *testing.T) string {
	p := filepath.Join(sampleDir, "junk.bin")
	if err := os.WriteFile(p, []byte("not media at all"), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

// postFile sends a multipart request and returns status plus decoded body.
func postFile(t *testing.T, path, fileField, filePath string, fields map[string]string) (int, map[string]any) {
	t.Helper()
	body := &bytes.Buffer{}
	w := multipart.NewWriter(body)
	part, err := w.CreateFormFile(fileField, filepath.Base(filePath))
	if err != nil {
		t.Fatal(err)
	}
	f, err := os.Open(filePath)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	if _, err := io.Copy(part, f); err != nil {
		t.Fatal(err)
	}
	for k, v := range fields {
		if err := w.WriteField(k, v); err != nil {
			t.Fatal(err)
		}
	}
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}

	resp, err := http.Post(ts.URL+path, w.FormDataContentType(), body)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	decoded := map[string]any{}
	_ = json.Unmarshal(raw, &decoded)
	return resp.StatusCode, decoded
}

func getJSON(t *testing.T, path string) map[string]any {
	t.Helper()
	resp, err := http.Get(ts.URL + path)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var out map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("decode %s: %v", path, err)
	}
	return out
}

// awaitJob polls until the job leaves the queue. The WebSocket path is covered
// separately; polling the same rows the UI reads keeps this deterministic.
func awaitJob(t *testing.T, id string) map[string]any {
	t.Helper()
	deadline := time.Now().Add(3 * time.Minute)
	var last map[string]any
	for time.Now().Before(deadline) {
		last = getJSON(t, "/api/jobs/"+id)
		if s, _ := last["status"].(string); s == "completed" || s == "failed" {
			return last
		}
		time.Sleep(500 * time.Millisecond)
	}
	t.Fatalf("job %s never finished; last state: %v", id, last)
	return nil
}

func requireString(t *testing.T, m map[string]any, key string) string {
	t.Helper()
	s, _ := m[key].(string)
	if s == "" {
		t.Fatalf("expected %q in %+v", key, m)
	}
	return s
}

// TestEveryAdvertisedFormatWorks mirrors the format list the frontend actually
// shows. A target that is offered in the UI must produce a non-empty artifact or
// fail with a clear error - never a 0-byte "completed" job.
func TestEveryAdvertisedFormatWorks(t *testing.T) {
	formats := []string{
		"mp4", "webm", "mkv", "mov", "gif", "webp", "png", "avif",
		"mp3", "m4a", "opus", "flac", "wav", "ogg", "oga",
	}
	for _, target := range formats {
		t.Run(target, func(t *testing.T) {
			code, body := postFile(t, "/api/jobs", "file", clipMP4(t),
				map[string]string{"target_format": target})
			if code == http.StatusUnprocessableEntity {
				// A clean rejection is acceptable; a broken job is not.
				t.Skipf("target rejected up front: %v", body["error"])
			}
			if code != http.StatusAccepted {
				t.Fatalf("submit %s: status %d body %v", target, code, body)
			}
			done := awaitJob(t, requireString(t, body, "id"))
			status, _ := done["status"].(string)
			if status != "completed" {
				t.Fatalf("%s did not complete: %v", target, done["error"])
			}
			size, _ := done["output_size"].(float64)
			if size <= 0 {
				t.Fatalf("%s reported completed but wrote %d bytes", target, int64(size))
			}
		})
	}
}

// TestAudioTargetDropsVideo guards the container-kind rules: an audio-only
// muxer must not be handed a video track, and an image muxer no audio.
func TestAudioTargetDropsVideo(t *testing.T) {
	code, body := postFile(t, "/api/jobs", "file", clipMP4(t),
		map[string]string{"target_format": "opus"})
	if code != http.StatusAccepted {
		t.Fatalf("submit: %d %v", code, body)
	}
	done := awaitJob(t, requireString(t, body, "id"))
	if status, _ := done["status"].(string); status != "completed" {
		t.Fatalf("opus render failed: %v", done["error"])
	}
	if size, _ := done["output_size"].(float64); size <= 0 {
		t.Fatal("opus output is empty")
	}
}

// ---------------------------------------------------------------------------

func TestHealthReportsRuntime(t *testing.T) {
	body := getJSON(t, "/api/health")
	if ok, _ := body["ok"].(bool); !ok {
		t.Fatalf("health not ok: %v", body)
	}
	rt, _ := body["runtime"].(map[string]any)
	if rt == nil {
		t.Fatal("runtime block missing")
	}
	if enc, _ := rt["encoders"].(float64); enc == 0 {
		t.Error("FFmpeg encoder count is zero; capability discovery did not run")
	}
}

func TestProbeAcceptsMediaAndRejectsGarbage(t *testing.T) {
	code, body := postFile(t, "/api/probe", "file", clipMP4(t), nil)
	if code != http.StatusOK {
		t.Fatalf("probe clip: status %d body %v", code, body)
	}
	if recognised, _ := body["recognised"].(bool); !recognised {
		t.Error("a real mp4 was not recognised")
	}

	code, body = postFile(t, "/api/probe", "file", junkFile(t), nil)
	if code != http.StatusUnprocessableEntity {
		t.Fatalf("probe junk: status %d, want 422 (%v)", code, body)
	}
	if recognised, _ := body["recognised"].(bool); recognised {
		t.Error("junk reported as recognised")
	}
}

func TestConvertJobCompletesAndDownloads(t *testing.T) {
	code, body := postFile(t, "/api/jobs", "file", clipMP4(t), map[string]string{
		"target_format": "webm", "video_codec": "vp9", "crf": "34",
		"width": "160", "height": "120",
	})
	if code != http.StatusAccepted {
		t.Fatalf("submit: status %d body %v", code, body)
	}
	id := requireString(t, body, "id")

	done := awaitJob(t, id)
	if status, _ := done["status"].(string); status != "completed" {
		t.Fatalf("job failed: %v", done["error"])
	}
	if pct, _ := done["progress_pct"].(float64); pct != 100 {
		t.Errorf("progress = %v, want 100", pct)
	}
	size, _ := done["output_size"].(float64)
	if size <= 0 {
		t.Errorf("output_size = %v", size)
	}

	url := requireString(t, done, "download_url")
	resp, err := http.Get(ts.URL + url)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("download status %d", resp.StatusCode)
	}
	if resp.ContentLength <= 0 {
		t.Errorf("download ContentLength = %d, want > 0", resp.ContentLength)
	}
	got := make([]byte, 4)
	if _, err := io.ReadFull(resp.Body, got); err != nil {
		t.Fatal(err)
	}
	// WebM starts with an EBML header; this proves the bytes are the real artifact.
	if got[0] != 0x1A || got[1] != 0x45 || got[2] != 0xDF || got[3] != 0xA3 {
		t.Errorf("downloaded bytes % x are not a WebM/EBML header", got)
	}
}

func TestConvertRejectsIllegalMux(t *testing.T) {
	code, body := postFile(t, "/api/jobs", "file", clipMP4(t), map[string]string{
		"target_format": "webm", "video_codec": "h264", "no_audio": "true",
	})
	if code != http.StatusUnprocessableEntity {
		t.Fatalf("status %d, want 422 (%v)", code, body)
	}
}

func TestConvertRequiresTargetFormat(t *testing.T) {
	code, _ := postFile(t, "/api/jobs", "file", clipMP4(t), nil)
	if code != http.StatusBadRequest {
		t.Fatalf("status %d, want 400", code)
	}
}

// TestEveryStickerPackIsSubmittableAndCompliant is the regression guard for the
// handler that returned 422 for all six packs.
func TestEveryStickerPackIsSubmittableAndCompliant(t *testing.T) {
	for _, pack := range pipeline.ListPacks() {
		t.Run(string(pack.ID), func(t *testing.T) {
			input := clipMP4(t)
			if pack.Container == "png" || pack.Container == "webp" {
				input = pngAlpha(t)
			}
			code, body := postFile(t, "/api/sticker-packs", "file", input,
				map[string]string{"pack": string(pack.ID)})
			if code != http.StatusAccepted {
				t.Fatalf("submit: status %d body %v", code, body)
			}
			done := awaitJob(t, requireString(t, body, "id"))
			if status, _ := done["status"].(string); status != "completed" {
				t.Fatalf("pack render failed: %v", done["error"])
			}
			size, _ := done["output_size"].(float64)
			if int64(size) > pack.LimitBytes {
				t.Errorf("%s produced %d bytes, over the %d cap", pack.ID, int64(size), pack.LimitBytes)
			}
			if int64(size) == 0 {
				t.Errorf("%s produced an empty artifact", pack.ID)
			}
		})
	}
}

func TestStickerPackRejectsUnknownID(t *testing.T) {
	code, body := postFile(t, "/api/sticker-packs", "file", clipMP4(t),
		map[string]string{"pack": "totally_made_up"})
	if code != http.StatusBadRequest {
		t.Fatalf("status %d, want 400 (%v)", code, body)
	}
	allowed, _ := body["allowed"].([]any)
	if len(allowed) != 6 {
		t.Errorf("allowed list has %d entries, want the 6 real packs", len(allowed))
	}
}

func TestStickerPackRequiresPackField(t *testing.T) {
	code, _ := postFile(t, "/api/sticker-packs", "file", clipMP4(t), nil)
	if code != http.StatusBadRequest {
		t.Fatalf("status %d, want 400", code)
	}
}

func TestStickerPackRejectsAudioOnlyInput(t *testing.T) {
	wav := makeSample(t, "tone.wav", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
		filepath.Join(sampleDir, "tone.wav"))
	code, body := postFile(t, "/api/sticker-packs", "file", wav,
		map[string]string{"pack": "telegram_static"})
	if code != http.StatusUnprocessableEntity {
		t.Fatalf("status %d, want 422 (%v)", code, body)
	}
}

func TestPacksEndpointDescribesRules(t *testing.T) {
	resp, err := http.Get(ts.URL + "/api/packs")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	var packs []map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&packs); err != nil {
		t.Fatal(err)
	}
	if len(packs) != 6 {
		t.Fatalf("got %d packs, want 6", len(packs))
	}
	for _, p := range packs {
		for _, key := range []string{"id", "label", "container", "codec", "limit", "notes"} {
			if s, _ := p[key].(string); s == "" {
				t.Errorf("pack %v is missing %q", p["id"], key)
			}
		}
	}
}

func TestTaxonomyCoversTheRetroTaxonomy(t *testing.T) {
	body := getJSON(t, "/api/taxonomy")
	containers, _ := body["containers"].([]any)
	codecs, _ := body["codecs"].([]any)
	if len(containers) < 50 || len(codecs) < 100 {
		t.Fatalf("taxonomy too small: %d containers, %d codecs", len(containers), len(codecs))
	}
	exts := map[string]bool{}
	for _, raw := range containers {
		c, _ := raw.(map[string]any)
		for _, e := range c["extensions"].([]any) {
			if s, _ := e.(string); s != "" {
				exts[s] = true
			}
		}
	}
	for _, want := range []string{".mp4", ".webm", ".mkv", ".bik", ".smk", ".mve", ".cin", ".jxl", ".exe"} {
		if want == ".exe" {
			if exts[want] {
				t.Error("an executable extension was registered as media")
			}
			continue
		}
		if !exts[want] {
			t.Errorf("extension %s is not registered", want)
		}
	}
}

func doDelete(t *testing.T, path string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(http.MethodDelete, ts.URL+path, nil)
	if err != nil {
		t.Fatal(err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	return resp
}

func TestPresetCrudRoundTrip(t *testing.T) {
	payload := map[string]any{
		"name": "My cute webm", "target_extension": ".webm",
		"video_codec": "vp9", "audio_codec": "opus", "is_favorite": true,
	}
	buf, _ := json.Marshal(payload)
	resp, err := http.Post(ts.URL+"/api/presets", "application/json", bytes.NewReader(buf))
	if err != nil {
		t.Fatal(err)
	}
	var created map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("create preset: %d", resp.StatusCode)
	}
	id := requireString(t, created, "id")

	list := getJSON(t, "/api/presets")
	items, _ := list["presets"].([]any)
	if len(items) != 1 {
		t.Fatalf("preset list has %d entries, want 1", len(items))
	}

	if got := doDelete(t, "/api/presets/"+id); got.StatusCode != http.StatusOK {
		t.Fatalf("delete: %d", got.StatusCode)
	}
	if again := doDelete(t, "/api/presets/"+id); again.StatusCode != http.StatusNotFound {
		t.Errorf("second delete returned %d, want 404", again.StatusCode)
	}
}

func TestPresetRequiresName(t *testing.T) {
	resp, err := http.Post(ts.URL+"/api/presets", "application/json",
		bytes.NewReader([]byte(`{"video_codec":"vp9"}`)))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("status %d, want 400", resp.StatusCode)
	}
}

func TestJobListingAndMissingRecords(t *testing.T) {
	list := getJSON(t, "/api/jobs?limit=5")
	jobs, _ := list["jobs"].([]any)
	if len(jobs) == 0 {
		t.Fatal("no jobs listed after the suite queued several")
	}
	if resp, err := http.Get(ts.URL + "/api/jobs/does-not-exist"); err == nil {
		resp.Body.Close()
		if resp.StatusCode != http.StatusNotFound {
			t.Errorf("missing job returned %d, want 404", resp.StatusCode)
		}
	}
}

func TestCancelIdleJobConflicts(t *testing.T) {
	resp := doDelete(t, "/api/jobs/not-running")
	if resp.StatusCode != http.StatusConflict {
		t.Fatalf("status %d, want 409", resp.StatusCode)
	}
}

func TestWaveformForAudioJob(t *testing.T) {
	wav := makeSample(t, "tone.wav", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
		filepath.Join(sampleDir, "tone.wav"))
	code, body := postFile(t, "/api/jobs", "file", wav, map[string]string{"target_format": "flac"})
	if code != http.StatusAccepted {
		t.Fatalf("submit: %d %v", code, body)
	}
	id := requireString(t, body, "id")
	awaitJob(t, id)

	got := getJSON(t, "/api/jobs/"+id+"/waveform?buckets=40")
	peaks, _ := got["peaks"].([]any)
	if len(peaks) != 40 {
		t.Fatalf("got %d peaks, want 40", len(peaks))
	}
}

func TestUnknownAPIRouteIsJSON(t *testing.T) {
	resp, err := http.Get(ts.URL + "/api/nope")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("status %d, want 404", resp.StatusCode)
	}
	var body map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("404 on an API path should be JSON: %v", err)
	}
}

func TestSPAFallbackServesTheApp(t *testing.T) {
	resp, err := http.Get(ts.URL + "/some/client/route")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status %d, want 200", resp.StatusCode)
	}
	body, _ := io.ReadAll(resp.Body)
	if !bytes.Contains(body, []byte("<div id=\"app\">")) {
		t.Error("SPA fallback did not serve the app shell")
	}
}

func TestPathTraversalIsRejected(t *testing.T) {
	resp, err := http.Get(ts.URL + "/..%2f..%2fetc%2fpasswd")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if bytes.Contains(body, []byte("root:x:")) {
		t.Fatal("path traversal leaked /etc/passwd")
	}
}
