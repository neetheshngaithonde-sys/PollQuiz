# PollQuiz — Real-Time Live Audience Polling SaaS

A high-performance, real-time live audience polling application designed for interactive presentations, lectures, and live events. Built with **Go (Gin)**, **React (Vite)**, **MongoDB**, and **Redis Pub/Sub**.

When an audience member votes, every connected viewer on the same poll sees live vote counts and animated progress bars update instantaneously **without refreshing or polling**.

---

## 🚀 Key Features

- **Authentication & Security**
  - Secure signup and login with Bcrypt salted password hashing.
  - Stateless JWT authentication with standard 7-day expiry.
  - Protected API endpoints & client-side route guards.
- **Dynamic Poll Creation**
  - Create polls with customizable questions and 2 to 10 options.
  - Add or remove options dynamically in real-time.
  - Instant server-side validation preventing duplicate or malformed options.
  - Unique shareable link generation with one-click clipboard copy.
- **Poll Management Dashboard**
  - Creator metrics: Total Polls Created, Active Polls, Total Audience Votes.
  - My Polls filterable view (All / Active / Closed) with search by question.
  - Instant toggle to open or close voting.
  - Permanent poll deletion with cascade vote cleanup.
- **Audience Voting Experience**
  - Frictionless access: No account required to cast a vote.
  - Clean, mobile-first card selection UI.
  - Duplicate vote prevention using client fingerprinting and IP validation.
  - Confetti burst animation upon voting with immediate transition to live results.
- **Genuine Real-Time Live Results**
  - **Driven by Redis Pub/Sub**: Votes trigger Go backend atomic MongoDB increments and publish updates to Redis channels.
  - **WebSocket Hub**: Pushes updates strictly to clients subscribed to that specific poll room.
  - Animated percentage bars, vote count badges, and winner indicators.
  - Live pulse status pill (`● LIVE UPDATES ACTIVE`).

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite | Component-driven UI, fast reactive state, responsive mobile design |
| **Icons & FX** | Lucide React, Canvas Confetti | Modern UI icons & celebratory voting micro-interactions |
| **Backend** | Go (Golang) + Gin | Ultra-fast concurrent HTTP server, WebSocket routing & validation |
| **Database** | MongoDB | Document persistence for users, polls, options, and vote logs |
| **Real-Time** | Redis Pub/Sub + WebSockets | Low-latency event streaming across concurrent browser sessions |
| **Security** | Bcrypt & JWT (golang-jwt/v5) | Cryptographic password hashing & claims-based authentication |

---

## 📐 Architecture & Data Flow

```
Audience Casts Vote
       │
       ▼
 [React Frontend]
       │  HTTP POST /api/polls/:id/vote
       ▼
  [Go / Gin API] ──► Validation & Duplicate Check
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[MongoDB Persistence]            [Redis Pub/Sub]
  - Atomic $inc vote count         - PUBLISH poll:{id}:updates
  - Store vote audit log                 │
                                         ▼
                               [Redis Subscriber]
                                         │
                                         ▼
                               [Gorilla WebSocket Hub]
                                 - Room-filtered broadcast
                                         │
                                         ▼
                             [All Connected Viewers]
                                 - Live Results Animated!
```

---

## 📁 Project Structure

```
Poll Quiz/
├── backend/
│   ├── main.go                       # Application entrypoint
│   ├── realtime_test.go              # End-to-end real-time integration test
│   ├── go.mod / go.sum               # Go modules & dependencies
│   ├── .env.example / .env           # Backend environment configuration
│   ├── config/
│   │   ├── config.go                 # Environment loader
│   │   ├── database.go               # MongoDB connection client
│   │   └── redis.go                  # Redis client initialization
│   ├── models/                       # Data models & DTO definitions
│   │   ├── user.go
│   │   ├── poll.go
│   │   └── vote.go
│   ├── repository/                   # MongoDB collection queries
│   │   ├── user_repo.go
│   │   ├── poll_repo.go              # Atomic $inc updates
│   │   └── vote_repo.go              # Duplicate checking
│   ├── services/                     # Business logic
│   │   ├── auth_service.go
│   │   ├── poll_service.go
│   │   ├── vote_service.go
│   │   └── realtime_service.go       # Redis Pub/Sub & WebSocket Hub
│   ├── handlers/                     # HTTP and WS controllers
│   │   ├── auth_handler.go
│   │   ├── poll_handler.go
│   │   ├── vote_handler.go
│   │   └── websocket_handler.go
│   ├── middleware/                   # JWT auth, CORS, recovery
│   │   ├── auth_middleware.go
│   │   └── cors_middleware.go
│   ├── routes/                       # Router definitions
│   │   └── routes.go
│   ├── utils/                        # Password hashing, JWT, JSON responses
│   │   ├── jwt.go
│   │   ├── password.go
│   │   └── response.go
│   └── Dockerfile                    # Multi-stage Go production container
│
├── frontend/
│   ├── index.html                    # HTML5 entry with meta SEO tags
│   ├── package.json                  # Dependencies (Vite, React, Lucide)
│   ├── vite.config.js                # Vite build configuration
│   ├── nginx.conf                    # Production Nginx SPA routing
│   ├── Dockerfile                    # Multi-stage Nginx container
│   ├── .env.example / .env           # Frontend environment configuration
│   └── src/
│       ├── main.jsx                  # React DOM root
│       ├── App.jsx                   # Route coordinator & toasts
│       ├── index.css                 # Modern CSS design system
│       ├── context/
│       │   └── AuthContext.jsx       # User auth session provider
│       ├── services/
│       │   ├── api.js                # Fetch client with Bearer injection
│       │   ├── authService.js        # Register, login, getMe
│       │   ├── pollService.js        # Create, vote, toggle, results
│       │   └── websocketService.js   # Native WS with auto-reconnection
│       ├── components/
│       │   ├── Navbar.jsx            # Header with mobile drawer
│       │   ├── ProtectedRoute.jsx    # Auth route guard
│       │   ├── PollCard.jsx          # Poll summary card with actions
│       │   ├── ResultBar.jsx         # Animated percentage bar
│       │   └── ShareModal.jsx        # Shareable link dialogue
│       └── pages/
│           ├── Landing.jsx           # Hero & interactive teaser demo
│           ├── Login.jsx             # User sign in
│           ├── Signup.jsx            # User registration
│           ├── Dashboard.jsx         # Creator metrics & recent polls
│           ├── CreatePoll.jsx        # Dynamic option poll builder
│           ├── MyPolls.jsx           # Searchable poll inventory
│           ├── PublicPoll.jsx        # Voter submission interface
│           └── LiveResults.jsx       # Real-time WebSocket result display
│
├── docker-compose.yml                # Full stack container orchestration
├── .gitignore                        # Git exclusion rules
└── README.md                         # Project documentation
```

---

## ⚡ Getting Started Locally

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Go** (v1.22+)
- **MongoDB** running locally on port `27017`
- **Redis** running locally on port `6379`

### 1. Start Database & Redis
Ensure MongoDB and Redis are active on your machine:
```powershell
# Verify MongoDB on 27017
Test-NetConnection -ComputerName localhost -Port 27017

# Verify Redis on 6379
redis-cli ping
# Output: PONG
```

### 2. Configure & Run Go Backend
```bash
cd backend
cp .env.example .env

# Run backend service (runs on http://localhost:8080)
go run main.go
```

### 3. Configure & Run React Frontend
```bash
cd frontend
cp .env.example .env
npm install

# Run frontend dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🧪 Automated Testing

To run the full end-to-end integration test validating MongoDB, Redis Pub/Sub, and WebSocket broadcast:
```bash
cd backend
go test -v -run TestRealtimePollFlow
```

**Test Execution Output:**
```
=== RUN   TestRealtimePollFlow
Connected to MongoDB at mongodb://127.0.0.1:27017, database: pollquiz
Connected to Redis at 127.0.0.1:6379
[Redis Pub/Sub] Subscribed to pattern: poll:*:updates
[WebSocket] Client connected to poll (Active viewers in room: 1)
[Redis] Published live vote update to channel poll:...:updates
SUCCESS! Received real-time live update over WebSocket: Type=VOTE_UPDATE, TotalVotes=1, Option 0 Votes=1 (100%)
--- PASS: TestRealtimePollFlow (0.21s)
PASS
```

---

## 📡 API Reference

### Authentication
- `POST /api/auth/register` — Create new user account.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET /api/auth/me` *(Protected)* — Get current user profile.

### Poll Management
- `POST /api/polls` *(Protected)* — Create a poll with dynamic options.
- `GET /api/polls/my` *(Protected)* — Retrieve all polls created by the authenticated user.
- `GET /api/polls/:id` — Public endpoint to fetch question and available options.
- `GET /api/polls/:id/results` — Public endpoint to fetch current tallies and percentages.
- `POST /api/polls/:id/vote` — Public endpoint to cast a vote.
- `PATCH /api/polls/:id/status` *(Protected)* — Toggle poll between active and closed.
- `DELETE /api/polls/:id` *(Protected)* — Permanently remove poll and its vote records.

### Real-Time WebSocket
- `GET /ws/polls/:id` — Upgrade connection to WebSocket stream for live results.

---

## 🐳 Docker Deployment

The entire four-tier stack can be deployed with a single command:
```bash
docker-compose up -d --build
```
This orchestrates:
- `pollquiz-frontend` on port `80`
- `pollquiz-backend` on port `8080`
- `pollquiz-mongo` on port `27017`
- `pollquiz-redis` on port `6379`
