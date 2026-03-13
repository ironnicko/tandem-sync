# 🚲 TandemSync

A **real-time ride coordination platform** enabling users to create, join, and share rides — powered by a scalable backend built with **Go**, **Gorilla**, **Dragonfly**, and **MongoDB**, and a modern frontend using **Next.js (React)**.

---

## 🧠 Overview

TandemSync is designed for **live location updates**, **real-time ride tracking**, and **instant user coordination**.

Built for performance and scalability — the backend leverages **Dragonfly** for ultra-fast pub/sub communication and caching, and **Gorilla** for persistent WebSocket connections with clients.

---


https://github.com/user-attachments/assets/abc89dd0-3965-47a8-9f55-008a37c598d1





## ⚙️ Tech Stack

### 🧩 Backend

* **Go (Gin)** — REST + GraphQL API
* **GraphQL (gqlgen)** — Flexible data querying
* **MongoDB** — Persistent storage for users, rides, and signals
* **Dragonfly DB** — Redis-compatible in-memory store for:

  * Socket presence and state tracking
  * Pub/Sub ride events
  * Session caching
* **Gorilla WebSocket Server** — Real-time ride signaling and coordination
* **better-auth** — Modern auth with OAuth (Google) + email/password

### 🌐 Frontend

* **React + Next.js** — Interactive client app with SSR
* **Zustand** — Global state management
* **Gorilla Client** — Real-time updates in the browser
* **TypeScript + Tailwind CSS** — Scalable and clean UI

### ☁️ Infrastructure

* **AWS EC2 / ECS** — Hosting backend and socket services
* **Docker & Docker Compose** — Local development and containerized deployments
* **Traefik** — Reverse proxy and static asset serving

---

## 🚀 Features

* 🔐 **better-auth** — Modern authentication with Google OAuth + email/password
* 🧍 **User Management** — Unique email-based accounts with profiles
* 🚴 **Rides API** — Create, join, and manage rides with real-time status
* 🛰️ **Real-time Ride Updates** — Live ride events via WebSocket + Dragonfly pub/sub
* 🗺️ **Live Location Sharing** — Seamless location broadcasting to ride participants
* 💬 **Signal Broadcasting** — Real-time turn signals and navigation hints
* 🏁 **Ride End Notifications** — Automatic cleanup and notifications when rides end
* 🧩 **GraphQL + REST APIs** — Flexible data querying and management
* 🧾 **MongoDB Indexing** — Optimized for user and ride lookups
* 📱 **Push Notifications** — Web push support for ride events

---

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/tandem-sync.git
cd tandem-sync
```

### 2. Create Environment File

```ini
MONGO_URI=
KAFKA_BROKERS=localhost
JWT_SECRET=
REFRESH_SECRET=
SERVER_PORT=8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_MAP_ID=
NEXT_PUBLIC_API_URL=https://localhost:8000/api/v1
GOOGLE_REDIRECT_URL=https://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=https://localhost:3000
REDIS_HOST=dragonfly
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
MY_EMAIL=
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will spin up:

* 🧩 **MongoDB** → persistent data
* ⚡ **Dragonfly DB** → caching and pub/sub
* 🧠 **Go Backend (Gin + GraphQL)**
* 🔌 **Go WebSocket Server** → real-time coordination
* 🔐 **Auth Server (Bun/Express + better-auth)**

---

## 🏗️ Architecture

### Microservices Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                          │
│  • User UI (rides, dashboard, real-time updates)                │
│  • Zustand store (auth, rides, socket state)                    │
│  • WebSocket client for real-time coordination                  │
└──────────┬──────────────────────────┬──────────────────────────┘
           │                          │
    (GraphQL/REST)            (WebSocket + Bearer Token)
           │                          │
   ┌───────▼────────┐      ┌─────────▼──────────┐
   │  Backend (Go)  │      │  WebSocket Server  │
   │  • GraphQL API │      │      (Go)          │
   │  • REST API    │      │  • Room management │
   │  • Ride logic  │      │  • Real-time sync  │
   └───────┬────────┘      │  • Pub/sub         │
           │               └─────────┬──────────┘
           │                         │
       ┌───┴──────────────────────────┴───┐
       │ better-auth (Bun/Express)        │
       │ • OAuth flow (Google)            │
       │ • Session management             │
       │ • User account operations        │
       └───────────┬──────────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │  Dragonfly (Cache + Pub/Sub)    │
        │  • User presence tracking       │
        │  • Ride room subscriptions      │
        │  • Session caching              │
        └──────────┬──────────────────────┘
                   │
            ┌──────▼──────────┐
            │    MongoDB      │
            │  • Users        │
            │  • Rides        │
            │  • Sessions     │
            └─────────────────┘
```

### Data Flow

1. **User Authentication**
   - Frontend → better-auth (OAuth/Email+Password)
   - better-auth → MongoDB (user creation/validation)
   - better-auth → Frontend (session token + refresh token)

2. **Ride Creation & Management**
   - Frontend → Backend (GraphQL `createRide`, `updateRide`)
   - Backend → MongoDB (persist ride data)
   - Backend → Dragonfly (cache active rides)

3. **Real-time Ride Coordination**
   - Frontend → WebSocket Server (joinRide, sendLocation, sendSignal)
   - WebSocket Server → Dragonfly (pub/sub room broadcast)
   - Dragonfly → WebSocket Server → All clients in room

4. **Ride End Workflow**
   - Organizer clicks "End Ride" → WebSocket broadcasts `rideEnded` event
   - All clients receive event → OnGoingTrip hook calls `handleRemoveCurrentRide`
   - Frontend clears current ride state, disconnects socket
   - Backend updates ride status in MongoDB

### Service Communication

| From | To | Method | Purpose |
|------|-----|--------|---------|
| Frontend | better-auth | HTTP | Authentication (signup, login, logout) |
| Frontend | Backend | GraphQL/REST | User/ride queries & mutations |
| Frontend | WebSocket Server | WebSocket | Real-time events (location, signals, room events) |
| WebSocket Server | Dragonfly | Redis protocol | Pub/sub room broadcasts |
| Backend | MongoDB | Connection | Persistent data storage |
| WebSocket Server | MongoDB | Connection | Ride data lookups |
| better-auth | MongoDB | Connection | User & session storage |

---

## 🧰 Development

### Start Services

```bash
# Backend (Go Gin + GraphQL)
cd Backend && go run main.go

# WebSocket Server (Go)
cd SocketServer && go run main.go

# Auth Server (Bun + better-auth)
cd AuthServer && bun index.ts

# Frontend (Next.js)
cd Frontend && bun dev
```

Open: [http://localhost:3000](http://localhost:3000)

**Note**: Recommend using Docker Compose or Traefik reverse proxy to handle port routing locally.

---

## 🔒 Security Notes

* Authentication via **better-auth** with secure session management
* WebSocket connections require bearer token authentication
* Protected GraphQL/REST routes validate session tokens
* Sensitive user data (e.g., passwords) handled by better-auth, excluded from APIs
* Recommended to use **HTTPS** + **secure cookies** in production

---

## 🌍 Deployment (AWS)

Typical setup:

* **AWS ECS / Fargate**: Gorilla + Dragonfly + Go backend + Frontend
* **AWS DocumentDB**: Mongo-compatible database
* **Route 53 + Traefik / AWS ACM + AWS ALB**: Domain routing and load balancing

---

## 📜 License

MIT © 2025
