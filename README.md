# TaskManager — Backend API

Node.js + Express + MongoDB REST API with JWT authentication, AES encryption, and full task management.

## Tech Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (HTTP-only cookies) |
| Encryption | bcryptjs (passwords), crypto-js AES (payloads) |
| Security | Helmet, express-rate-limit, express-validator |

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js # register, login, logout, getMe
│   │   └── taskController.js # CRUD + pagination + filter + search
│   ├── middleware/
│   │   ├── auth.js           # JWT verify via HTTP-only cookie
│   │   ├── encryption.js     # AES encrypt/decrypt middleware
│   │   ├── rules.js          # express-validator rules
│   │   └── validate.js       # validation error handler
│   ├── models/
│   │   ├── User.js           # User schema (bcrypt pre-save hook)
│   │   └── Task.js           # Task schema with indexes
│   └── routes/
│       ├── authRoutes.js     # /api/auth/*
│       └── taskRoutes.js     # /api/tasks/*
├── server.js                 # Entry point
├── .env.example              # Environment variable template
└── package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d
ENCRYPTION_KEY=your_32_char_encryption_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

---

## API Reference

**Base URL:** `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login, sets HTTP-only cookie |
| `POST` | `/auth/logout` | Private | Clear auth cookie |
| `GET` | `/auth/me` | Private | Get current user info |

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/tasks` | Private | List tasks (pagination, filter, search) |
| `GET` | `/tasks/:id` | Private | Get single task |
| `POST` | `/tasks` | Private | Create task |
| `PUT` | `/tasks/:id` | Private | Update task |
| `DELETE` | `/tasks/:id` | Private | Delete task |

#### GET /tasks — Query Parameters

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 8, max: 50) |
| `status` | string | Filter: `todo` \| `in-progress` \| `done` |
| `search` | string | Search by title (case-insensitive) |

---

## Sample Requests & Responses

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Rahul Rao",
  "email": "rahul@example.com",
  "password": "mypassword"
}
```
```json
HTTP 201
{
  "success": true,
  "message": "Account created successfully",
  "user": { "id": "...", "name": "Rahul Rao", "email": "rahul@example.com" }
}
Set-Cookie: token=<jwt>; Path=/; HttpOnly; SameSite=Lax
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "rahul@example.com", "password": "mypassword" }
```
```json
HTTP 200
{ "success": true, "message": "Logged in successfully", "user": { ... } }
```

### Create Task
```http
POST /api/tasks
Content-Type: application/json
(cookie: token=<jwt>)

{
  "title": "Fix login bug",
  "description": "The login button is broken on mobile",
  "status": "in-progress"
}
```
```json
HTTP 201
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "...",
    "title": "Fix login bug",
    "description": "The login button is broken on mobile",
    "status": "in-progress",
    "user": "...",
    "createdAt": "2026-02-25T17:00:00.000Z"
  }
}
```

### Get Tasks (paginated + filtered + searched)
```http
GET /api/tasks?page=1&limit=5&status=in-progress&search=login
(cookie: token=<jwt>)
```
```json
HTTP 200
{
  "success": true,
  "data": [ { "_id": "...", "title": "Fix login bug", "status": "in-progress", ... } ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Validation Error
```http
POST /api/tasks — with empty title
```
```json
HTTP 422
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "title", "message": "Title is required" }]
}
```

---

## Security Implementation

- **JWT** signed with `JWT_SECRET`, stored in `HttpOnly` cookie (inaccessible to JavaScript)
- **bcryptjs** hashes passwords with 12 salt rounds before storing
- **AES encryption** middleware (`crypto-js`) for encrypting sensitive response payloads
- **Helmet** sets secure HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- **Rate limiting** — 100 requests per 15 minutes per IP
- **CORS** restricted to `CLIENT_URL` environment variable
- **express-validator** sanitizes all inputs with `.escape()` to prevent injection
- **Authorization** — all task queries are scoped to `{ user: req.user._id }` so users can't access others' data

---

## Deployment (Render / Railway)

1. Push to GitHub
2. Create new Web Service → connect repo
3. **Root directory:** `Backend`
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. Add all environment variables from `.env.example` in the dashboard
7. Set `NODE_ENV=production` and `CLIENT_URL=https://your-frontend.vercel.app`
