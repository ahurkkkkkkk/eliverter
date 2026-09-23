// Command eliverter runs the desktop / development server: the same service the
// Android build hosts in-process, exposed on a local port with the frontend.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/TenOFSwordsr/eliverter/internal/api"
	"github.com/TenOFSwordsr/eliverter/internal/service"
)

func main() {
	var (
		addr    = flag.String("addr", "127.0.0.1:8420", "listen address")
		dataDir = flag.String("data", defaultDataDir(), "state directory for the database and artifacts")
		workers = flag.Int("workers", 0, "concurrent encodes, 0 picks a safe default")
	)
	flag.Parse()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	svc, err := service.New(ctx, service.Config{
		WorkDir:        filepath.Join(*dataDir, "uploads"),
		OutDir:         filepath.Join(*dataDir, "outputs"),
		DBPath:         filepath.Join(*dataDir, "eliverter.db"),
		Workers:        *workers,
		PruneInterval:  30 * time.Minute,
		MaxArtifactAge: 2 * time.Hour,
	})
	if err != nil {
		log.Fatalf("eliverter: %v", err)
	}

	router := api.New(svc)
	srv := &http.Server{
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		// Uploads stream for as long as a large file takes; no whole-body timeout.
		WriteTimeout: 0,
		IdleTimeout:  120 * time.Second,
	}

	// Bind explicitly so port 0 works: the Android host passes 127.0.0.1:0 and
	// needs to learn which port the kernel actually chose.
	ln, err := net.Listen("tcp", *addr)
	if err != nil {
		log.Fatalf("eliverter: listen %s: %v", *addr, err)
	}
	url := fmt.Sprintf("http://%s", ln.Addr().String())

	go func() {
		if err := srv.Serve(ln); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("eliverter: serve: %v", err)
		}
	}()

	// Machine-readable line for a supervising parent process, printed before the
	// human-readable banner so a line-scanning reader sees it first.
	fmt.Printf("ELIVERTER_URL %s\n", url)
	fmt.Printf("Eliverter is up at %s  (data in %s)\n", url, *dataDir)
	os.Stdout.Sync()

	<-ctx.Done()
	fmt.Println("\neliverter: draining")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
	svc.Shutdown()
}

func defaultDataDir() string {
	if v := os.Getenv("ELIVERTER_DATA"); v != "" {
		return v
	}
	base, err := os.UserCacheDir()
	if err != nil {
		return filepath.Join(os.TempDir(), "eliverter")
	}
	return filepath.Join(base, "eliverter")
}
