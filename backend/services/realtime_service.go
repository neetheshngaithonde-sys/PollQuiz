package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"poll-quiz-backend/models"

	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow cross-origin WebSocket connections
	},
}

type Client struct {
	Hub    *RealtimeHub
	Conn   *websocket.Conn
	PollID string
	Send   chan []byte
}

type RealtimeHub struct {
	redisClient *redis.Client
	rooms       map[string]map[*Client]bool
	register    chan *Client
	unregister  chan *Client
	broadcast   chan *BroadcastMessage
	mu          sync.RWMutex
}

type BroadcastMessage struct {
	PollID  string
	Payload []byte
}

func NewRealtimeHub(redisClient *redis.Client) *RealtimeHub {
	return &RealtimeHub{
		redisClient: redisClient,
		rooms:       make(map[string]map[*Client]bool),
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		broadcast:   make(chan *BroadcastMessage),
	}
}

func (h *RealtimeHub) Run() {
	// Start background Redis subscription listener
	go h.listenRedisPubSub()

	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.rooms[client.PollID]; !ok {
				h.rooms[client.PollID] = make(map[*Client]bool)
			}
			h.rooms[client.PollID][client] = true
			log.Printf("[WebSocket] Client connected to poll %s (Active viewers in room: %d)", client.PollID, len(h.rooms[client.PollID]))
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.rooms[client.PollID]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.rooms, client.PollID)
					}
					log.Printf("[WebSocket] Client disconnected from poll %s", client.PollID)
				}
			}
			h.mu.Unlock()

		case msg := <-h.broadcast:
			h.mu.RLock()
			clients, ok := h.rooms[msg.PollID]
			if ok {
				for client := range clients {
					select {
					case client.Send <- msg.Payload:
					default:
						close(client.Send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// PublishUpdate publishes poll update to Redis Pub/Sub channel
func (h *RealtimeHub) PublishUpdate(ctx context.Context, pollID string, results *models.PollResultsResponse) error {
	msg := models.LiveUpdateMessage{
		Type:      "VOTE_UPDATE",
		PollID:    pollID,
		Results:   *results,
		Timestamp: time.Now(),
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	channel := fmt.Sprintf("poll:%s:updates", pollID)
	err = h.redisClient.Publish(ctx, channel, data).Err()
	if err != nil {
		log.Printf("[Redis] Failed to publish update to %s: %v", channel, err)
		return err
	}

	log.Printf("[Redis] Published live vote update to channel %s", channel)
	return nil
}

// listenRedisPubSub subscribes to all poll update channels via Redis pattern "poll:*:updates"
func (h *RealtimeHub) listenRedisPubSub() {
	ctx := context.Background()
	pubsub := h.redisClient.PSubscribe(ctx, "poll:*:updates")
	defer pubsub.Close()

	ch := pubsub.Channel()
	log.Println("[Redis Pub/Sub] Subscribed to pattern: poll:*:updates")

	for msg := range ch {
		// channel format: poll:<pollID>:updates
		parts := strings.Split(msg.Channel, ":")
		if len(parts) >= 3 {
			pollID := parts[1]
			h.broadcast <- &BroadcastMessage{
				PollID:  pollID,
				Payload: []byte(msg.Payload),
			}
		}
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WebSocket] Read error: %v", err)
			}
			break
		}
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(25 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages if any
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *RealtimeHub) ServeWebSocket(w http.ResponseWriter, r *http.Request, pollID string, initialData *models.PollResultsResponse) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WebSocket] Upgrade error: %v", err)
		return
	}

	client := &Client{
		Hub:    h,
		Conn:   conn,
		PollID: pollID,
		Send:   make(chan []byte, 256),
	}

	h.register <- client

	// Send initial state immediately to the newly connected viewer
	if initialData != nil {
		initMsg := models.LiveUpdateMessage{
			Type:      "INITIAL_STATE",
			PollID:    pollID,
			Results:   *initialData,
			Timestamp: time.Now(),
		}
		if data, err := json.Marshal(initMsg); err == nil {
			client.Send <- data
		}
	}

	go client.WritePump()
	go client.ReadPump()
}
