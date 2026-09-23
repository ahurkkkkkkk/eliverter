// Command eliverter-mobile builds the Android shared library.
//
// The APK loads this with System.loadLibrary, calls EliverterStart, and points a
// WebView at the returned loopback port. Hosting Gin in-process keeps one code
// path with the desktop build instead of maintaining a second, watered-down
// on-device implementation.
//
// Build:
//
//	GOOS=android GOARCH=arm64 CGO_ENABLED=1 go build -buildmode=c-shared
package main

/*
#include <stdlib.h>
#include <string.h>
*/
import "C"

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"path/filepath"
	"sync"
	"time"
	"unsafe"

	"github.com/TenOFSwordsr/eliverter/internal/api"
	"github.com/TenOFSwordsr/eliverter/internal/service"
)

var (
	mu      sync.Mutex
	inst    *instance
	lastErr string
)

type instance struct {
	svc      *service.Service
	server   *http.Server
	listener net.Listener
	cancel   context.CancelFunc
	port     int
}

// EliverterStart boots the service on a loopback port and returns that port.
// Returns -1 on failure; read EliverterLastError for the reason. Calling it
// again while running is a no-op that returns the existing port.
//
//export EliverterStart
func EliverterStart(workDir, nativeLibDir *C.char) C.int {
	mu.Lock()
	defer mu.Unlock()

	if inst != nil {
		return C.int(inst.port)
	}
	dir := C.GoString(workDir)
	if dir == "" {
		lastErr = "EliverterStart: work_dir is required"
		return -1
	}

	ctx, cancel := context.WithCancel(context.Background())
	svc, err := service.New(ctx, service.Config{
		WorkDir:        filepath.Join(dir, "uploads"),
		OutDir:         filepath.Join(dir, "outputs"),
		DBPath:         filepath.Join(dir, "eliverter.db"),
		NativeDir:      C.GoString(nativeLibDir),
		PruneInterval:  30 * time.Minute,
		MaxArtifactAge: 2 * time.Hour,
	})
	if err != nil {
		cancel()
		lastErr = err.Error()
		return -1
	}

	// Port 0 lets the kernel choose: a fixed port can already be taken on a
	// device, and the collision would fail app start with no recovery path.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		svc.Shutdown()
		cancel()
		lastErr = err.Error()
		return -1
	}
	port := ln.Addr().(*net.TCPAddr).Port
	srv := &http.Server{Handler: api.New(svc), ReadHeaderTimeout: 10 * time.Second}

	inst = &instance{svc: svc, server: srv, listener: ln, cancel: cancel, port: port}
	go func() {
		if err := srv.Serve(ln); err != nil && !errors.Is(err, http.ErrServerClosed) {
			mu.Lock()
			lastErr = err.Error()
			mu.Unlock()
		}
	}()
	return C.int(port)
}

// EliverterStop drains the HTTP server and the encode pool. Idempotent.
//
//export EliverterStop
func EliverterStop() {
	mu.Lock()
	defer mu.Unlock()
	if inst == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = inst.server.Shutdown(ctx)
	inst.svc.Shutdown()
	inst.cancel()
	inst = nil
}

// EliverterBaseURL writes "http://127.0.0.1:<port>" into buf, NUL-terminating
// it, and returns the number of characters written excluding the terminator.
// Returns 0 when the service is not running.
//
//export EliverterBaseURL
func EliverterBaseURL(buf *C.char, bufLen C.int) C.int {
	if buf == nil || bufLen <= 0 {
		return 0
	}
	mu.Lock()
	running := inst != nil
	port := 0
	if running {
		port = inst.port
	}
	mu.Unlock()
	if !running {
		return 0
	}

	url := fmt.Sprintf("http://127.0.0.1:%d", port)
	if len(url) >= int(bufLen) {
		return 0
	}
	c := C.CString(url)
	defer C.free(unsafe.Pointer(c))
	C.memcpy(unsafe.Pointer(buf), unsafe.Pointer(c), C.size_t(len(url)+1))
	return C.int(len(url))
}

// EliverterLastError returns a freshly allocated copy of the last failure
// reason. The caller owns it and must free it.
//
//export EliverterLastError
func EliverterLastError() *C.char {
	mu.Lock()
	defer mu.Unlock()
	return C.CString(lastErr)
}

// EliverterInfo returns a JSON blob describing the runtime, so the Java layer
// can log what it linked against without a second round trip.
//
//export EliverterInfo
func EliverterInfo() *C.char {
	mu.Lock()
	current := inst
	mu.Unlock()
	if current == nil {
		return C.CString(`{"running":false}`)
	}
	buf, err := json.Marshal(current.svc.Info())
	if err != nil {
		return C.CString(`{"running":true,"info_error":true}`)
	}
	return C.CString(string(buf))
}

// main is required by the Go toolchain for a package main build; the Android
// runtime never calls it.
func main() {}
