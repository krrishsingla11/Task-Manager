# 🚀 Primetrade Task Manager

> A production-quality, full-stack REST API with JWT authentication, Role-Based Access Control, and a React frontend — built for the Primetrade.ai Backend Developer Intern assignment.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Practices](#security-practices)
- [Scalability Design](#scalability-design)
- [Docker Deployment](#docker-deployment)

---

## ✨ Features

### Backend
- ✅ **JWT Authentication** – Secure login/register with bcrypt-hashed passwords
- ✅ **Role-Based Access Control** – `user` and `admin` roles with route guards
- ✅ **Full CRUD API** – Tasks with status, priority, due dates, tags
- ✅ **API Versioning** – All routes under `/api/v1`
- ✅ **Input Validation & Sanitization** – express-validator on all inputs
- ✅ **Rate Limiting** – 200 req/15min global, 20 req/15min for auth
- ✅ **Swagger/OpenAPI 3.0** – Interactive docs at `/api-docs`
- ✅ **Winston Logging** – Structured logs to console + files
- ✅ **Centralized Error Handling** – Consistent JSON error responses

### Frontend
- ✅ **React 18 + Vite** – Fast development and production builds
- ✅ **Protected Routes** – JWT-guarded dashboard and admin panel
- ✅ **Admin Panel** – User management, role promotion, platform stats
- ✅ **Task CRUD** – Create, view, edit, delete with filters and pagination
- ✅ **Toast Notifications** – Real-time success/error feedback
- ✅ **Dark Mode Design** – Premium glassmorphism UI

---

## 🏗️ Architecture

```
primetrade-task-manager/
├── backend/
│   ├── server.js              # Express entry point
│   ├── swagger.yaml           # OpenAPI 3.0 spec
│   ├── Dockerfile
│   └── src/
│       ├── config/            # DB connection, env loader
│       ├── models/            # User, Task (Mongoose)
│       ├── controllers/       # Auth, Task, Admin logic
│       ├── routes/v1/         # Versioned route groups
│       ├── middlewares/       # auth, roleGuard, errorHandler, validate
│       ├── validators/        # express-validator schemas
│       └── utils/             # logger, response helpers
├── frontend/
│   └── src/
│       ├── api/               # Axios instance + interceptors
│       ├── context/           # AuthContext (JWT + user state)
│       ├── components/        # Navbar, TaskCard, Modal, Toast, ProtectedRoute
│       └── pages/             # Login, Register, Dashboard, Admin
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or Docker

### 1. Clone and Setup Backend

```bash
cd backend
cp .env.example .env        # Edit JWT_SECRET and MONGO_URI
npm install
npm run dev
```

Backend runs at: **http://localhost:5000**  
Swagger docs at: **http://localhost:5000/api-docs**

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 3. Seed Demo Admin User (optional)

```bash
node backend/scripts/seed.js
```

Demo credentials:
| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@primetrade.ai    | Admin1234   |
| User  | user@primetrade.ai     | User1234    |

---

## 📄 API Documentation

**Interactive Swagger UI**: http://localhost:5000/api-docs

### Auth Endpoints (`/api/v1/auth`)

| Method | Path        | Auth | Description          |
|--------|-------------|------|----------------------|
| POST   | /register   | ❌   | Register new user    |
| POST   | /login      | ❌   | Login, get JWT token |
| GET    | /me         | ✅   | Get current user     |

### Task Endpoints (`/api/v1/tasks`)

| Method | Path   | Auth | Role | Description                        |
|--------|--------|------|------|------------------------------------|
| GET    | /      | ✅   | Any  | List tasks (own for user, all for admin) |
| POST   | /      | ✅   | Any  | Create task                        |
| GET    | /:id   | ✅   | Any  | Get single task                    |
| PUT    | /:id   | ✅   | Any  | Update task (own for user)         |
| DELETE | /:id   | ✅   | Any  | Delete task (own for user)         |

#### Query Parameters for GET /tasks:
- `status` – filter by `todo`, `in-progress`, `done`
- `priority` – filter by `low`, `medium`, `high`
- `page` / `limit` – pagination
- `sortBy` / `order` – sorting

### Admin Endpoints (`/api/v1/admin`) – Admin Only

| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| GET    | /users                  | List all users           |
| PATCH  | /users/:id/role         | Update user role         |
| PATCH  | /users/:id/deactivate   | Deactivate user account  |
| GET    | /stats                  | Platform statistics      |

---

## 🗄️ Database Schema

### User
```
{
  name:      String (2-50 chars, required)
  email:     String (unique, lowercase, validated)
  password:  String (bcrypt hashed, min 6 chars, select: false)
  role:      Enum ['user', 'admin'] (default: 'user')
  isActive:  Boolean (default: true)
  timestamps: createdAt, updatedAt
}
```

### Task
```
{
  title:       String (3-100 chars, required)
  description: String (max 500 chars)
  status:      Enum ['todo', 'in-progress', 'done'] (default: 'todo')
  priority:    Enum ['low', 'medium', 'high'] (default: 'medium')
  dueDate:     Date (nullable)
  tags:        [String]
  owner:       ObjectId → User (required)
  timestamps:  createdAt, updatedAt
}
```

**Indexes**: `{ owner: 1, status: 1 }` for fast ownership-filtered queries.

---

## 🔐 Security Practices

| Practice | Implementation |
|----------|---------------|
| Password Hashing | bcrypt with salt factor 12 |
| JWT | Signed with HS256, configurable expiry |
| Input Sanitization | `.escape()` on string inputs via express-validator |
| Rate Limiting | express-rate-limit: 200/15min global, 20/15min auth |
| HTTP Security Headers | helmet.js |
| CORS | Configurable allowed origins |
| Body Size Limit | `10kb` JSON payload cap |
| Field Projection | `password` field excluded from all queries by default |
| Role Guard | Middleware factory — `roleGuard('admin')` |

---

## 📈 Scalability Design

### Horizontal Scaling
- **Stateless API** – JWT-based auth means any instance can serve any request
- **Load Balancer ready** – No in-process session state
- **MongoDB replica sets** – Supported by Mongoose connection config

### Caching (Redis — next step)
```
GET /tasks    →  Cache with TTL = 60s per user
POST/PUT/DELETE → Invalidate user's cache key
```

### Microservices Migration Path
The codebase is organized by domain (auth, tasks, admin) — each domain can be extracted into its own microservice behind an API Gateway (e.g., Kong or AWS API Gateway) with minimal refactoring.

### Performance
- **Mongoose indexes** on `owner + status` composite field
- **Pagination** enforced on all list endpoints (max 50 per page)
- **Promise.all** for parallel DB calls in admin stats

### Deployment
```bash
# Docker Compose (MongoDB + API)
docker-compose up -d

# Scale API horizontally
docker-compose up -d --scale backend=3
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

Services:
- **MongoDB** → port 27017
- **Backend API** → port 5000

---

## 📁 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/primetrade_tasks
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

---

## 🧪 Testing the API

Import the Postman collection: `./postman_collection.json`

Or use Swagger UI at `http://localhost:5000/api-docs`:
1. Register a user via `POST /api/v1/auth/register`
2. Copy the token from the response
3. Click **Authorize** → paste `Bearer <token>`
4. Test all protected endpoints

---

*Built by a passionate backend developer for the Primetrade.ai internship assignment.*
