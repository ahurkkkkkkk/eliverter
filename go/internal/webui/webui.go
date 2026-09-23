// Package webui serves the compiled Svelte frontend from the Go binary, so the
// Android build ships one artifact with no separate web server to reach.
package webui

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed all:dist
var bundled embed.FS

// Mount registers static asset routes and an SPA fallback on the engine.
func Mount(r *gin.Engine) {
	dist, err := fs.Sub(bundled, "dist")
	if err != nil {
		return
	}
	files := http.FileServer(http.FS(dist))
	r.GET("/assets/*filepath", gin.WrapH(files))
	r.GET("/favicon.svg", gin.WrapH(files))

	// History-mode routing means unknown non-API paths render the shell.
	r.NoRoute(func(c *gin.Context) {
		p := c.Request.URL.Path
		if strings.HasPrefix(p, "/api/") || strings.HasPrefix(p, "/ws/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "no such endpoint", "path": p})
			return
		}
		if strings.Contains(p, "..") {
			c.Status(http.StatusBadRequest)
			return
		}
		buf, err := fs.ReadFile(dist, "index.html")
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		c.Data(http.StatusOK, "text/html; charset=utf-8", buf)
	})
}
