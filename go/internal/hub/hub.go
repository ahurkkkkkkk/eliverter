// Package hub fans transcoding milestones out to WebSocket subscribers.
package hub

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,
	// The app is served from the same origin on device, and from Vite on the
	// dev machine; the request path is already scoped to /ws/jobs.
	CheckOrigin: func(r *http.Request) bool { return true },
}

// Event is one frame on the /ws/jobs stream.
type Event struct {
	Type      string    `json:"type"`
	JobID     string    `json:"job_id,omitempty"`
	Message   string    `json:"message,omitempty"`
	Pct       float64   `json:"pct,omitempty"`
	Frame     int64     `json:"frame,omitempty"`
	OutTimeMs int64     `json:"out_time_ms,omitempty"`
	Speed     float64   `json:"speed,omitempty"`
	SizeBytes int64     `json:"size_bytes,omitempty"`
	Phase     string    `json:"phase,omitempty"`
	Peaks     []float32 `json:"peaks,omitempty"`
	Payload   any       `json:"payload,omitempty"`
	At        int64     `json:"at"`
}

// Hub tracks live clients. Broadcast is non-blocking: a phone that cannot keep
// up gets dropped rather than stalling an encode.
type Hub struct {
	mu      sync.RWMutex
	clients map[*client]struct{}
	drop    chan *client
	add     chan *client
	bcast   chan Event
}

type client struct {
	conn    *websocket.Conn
	send    chan []byte
	closing sync.Once
}

// New starts the hub pump.
func New() *Hub {
	h := &Hub{
		clients: map[*client]struct{}{},
		drop:    make(chan *client, 16),
		add:     make(chan *client, 16),
		bcast:   make(chan Event, 256),
	}
	go h.run()
	return h
}

func (h *Hub) run() {
	for {
		select {
		case c := <-h.add:
			h.mu.Lock()
			h.clients[c] = struct{}{}
			h.mu.Unlock()
		case c := <-h.drop:
			h.mu.Lock()
			delete(h.clients, c)
			h.mu.Unlock()
			c.close()
		case ev := <-h.bcast:
			ev.At = time.Now().UnixMilli()
			buf, err := json.Marshal(ev)
			if err != nil {
				log.Printf("hub: marshal event: %v", err)
				continue
			}
			h.mu.RLock()
			for c := range h.clients {
				select {
				case c.send <- buf:
				default:
					// Slow consumer: queue it out instead of blocking the encoder.
					go func(c *client) { h.drop <- c }(c)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast publishes to every subscriber.
func (h *Hub) Broadcast(ev Event) {
	select {
	case h.bcast <- ev:
	default:
		log.Printf("hub: broadcast queue full, dropping %s event", ev.Type)
	}
}

// Clients reports the live subscriber count.
func (h *Hub) Clients() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// ServeWS upgrades an HTTP request into the job event stream.
func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	c := &client{conn: conn, send: make(chan []byte, 64)}
	h.add <- c

	go c.writePump(h)
	c.readPump(h)
}

func (c *client) readPump(h *Hub) {
	defer func() { h.drop <- c }()
	c.conn.SetReadLimit(512)
	_ = c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		return c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	})
	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			return
		}
	}
}

func (c *client) writePump(h *Hub) {
	ticker := time.NewTicker(25 * time.Second)
	defer func() { ticker.Stop(); c.close() }()
	for {
		select {
		case msg, ok := <-c.send:
			_ = c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				_ = c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			_ = c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *client) close() {
	c.closing.Do(func() {
		close(c.send)
		_ = c.conn.Close()
	})
}
