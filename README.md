# Anedya IoT Dashboard

A **production-grade IoT Dashboard** built with a React (Vite) frontend and a Node.js/Express backend, integrating with the [Anedya Cloud](https://anedya.io) APIs. It provides real-time device monitoring, relay control, historical telemetry charts, and secure role-based access control.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [User Roles & Seeded Users](#user-roles--seeded-users)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)

---

## Features

- 🔐 **JWT Authentication** — Secure login using JSON Web Tokens stored in HttpOnly cookies.
- 🛡️ **Role-Based Access Control (RBAC)** — Three-tier permission system (Admin / Operator / Viewer).
- 📡 **Real-Time Device Monitoring** — View all registered IoT devices and their online/offline status.
- 📊 **Historical Telemetry Charts** — Visualize sensor data (e.g., temperature) fetched directly from Anedya Cloud over a configurable time window.
- 🔌 **Relay Toggle Control** — Remotely switch device relays ON/OFF through the Anedya command API.
- 🧩 **Modular Architecture** — Clean separation between controllers, routes, middleware, services, and models.
- 🔒 **Security Hardened** — Helmet.js headers, CORS restrictions, bcrypt password hashing, and express-validator input validation.

---

## Tech Stack

### Backend
| Package | Purpose |
|---|---|
| `express` v5 | HTTP server and routing |
| `mongoose` | MongoDB ODM |
| `jsonwebtoken` | JWT generation and verification |
| `bcryptjs` | Password hashing |
| `cookie-parser` | HttpOnly cookie support |
| `helmet` | Secure HTTP headers |
| `cors` | Cross-Origin Resource Sharing |
| `express-validator` | Request body validation |
| `axios` + `axios-retry` | Anedya Cloud API client with retry logic |
| `dotenv` | Environment variable management |

### Frontend
| Package | Purpose |
|---|---|
| `react` v19 + `vite` v8 | UI framework and build tool |
| `react-router-dom` v7 | Client-side routing |
| `axios` | HTTP client |
| `recharts` | Telemetry data charts |
| `swr` | Data fetching with caching/revalidation |
| `lucide-react` | Icon library |
| `react-hot-toast` | Toast notifications |
| `tailwindcss` v4 | Utility-first CSS |

---

## Project Structure

```
Anedya/
├── backend/
│   ├── server.js               # Express app entry point
│   ├── seed.js                 # Database seeder (creates default admin & device)
│   ├── .env                    # Environment variables
│   └── src/
│       ├── config/
│       │   └── db.js           # MongoDB connection
│       ├── models/
│       │   ├── User.js         # User schema (name, email, password, role)
│       │   └── Device.js       # Device schema (deviceId, name, lastSeen, relayState)
│       ├── controllers/
│       │   ├── authController.js    # login, register, logout, profile
│       │   └── deviceController.js  # getDevices, getDeviceTelemetry, toggleRelay
│       ├── middleware/
│       │   ├── authMiddleware.js    # JWT protect middleware
│       │   └── rbacMiddleware.js    # Permission-based access control
│       ├── routes/
│       │   ├── authRoutes.js   # /api/auth (login, logout, register, profile)
│       │   └── deviceRoutes.js # /api/devices (list, telemetry, relay)
│       ├── services/
│       │   └── anedyaService.js    # Anedya Cloud API integration
│       └── utils/
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx             # Root component and router setup
        ├── main.jsx            # React DOM entry
        ├── pages/
        │   ├── Login.jsx       # Login page with form validation
        │   ├── Dashboard.jsx   # Main dashboard (devices + telemetry charts)
        │   └── Unauthorized.jsx # 403 error page
        ├── components/         # Reusable UI components
        ├── context/            # React context (AuthContext)
        ├── hooks/              # Custom hooks
        ├── layouts/            # App layout wrappers
        └── services/           # Axios API service layer
```

---

## Data Models

### User
| Field | Type | Description |
|---|---|---|
| `name` | String | Full name of the user |
| `email` | String | Unique email address |
| `password` | String | bcrypt-hashed password |
| `role` | String | One of `Admin`, `Operator`, `Viewer` (default: `Viewer`) |
| `isActive` | Boolean | Whether the account is active (default: `true`) |

> Passwords are automatically hashed via a `pre('save')` Mongoose hook using bcryptjs with a salt factor of 10.

### Device
| Field | Type | Description |
|---|---|---|
| `deviceId` | String | Anedya Cloud Device ID (unique) |
| `name` | String | Human-friendly device name |
| `lastSeen` | Date | Timestamp of last communication |
| `relayState` | Boolean | Current relay ON/OFF state |
| `isOnline` | Virtual | `true` if `lastSeen` < 5 minutes ago |

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login and receive JWT cookie |
| `POST` | `/api/auth/logout` | Public | Clear JWT cookie |
| `GET` | `/api/auth/profile` | Private | Get logged-in user's profile |
| `POST` | `/api/auth/register` | Admin only | Register a new user |

### Device Routes — `/api/devices`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/devices` | All roles | List all registered devices |
| `GET` | `/api/devices/:id/telemetry` | All roles | Get telemetry data from Anedya Cloud |
| `POST` | `/api/devices/:id/relay` | Admin, Operator | Toggle device relay ON/OFF |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns API status |

---

## Role-Based Access Control (RBAC)

The system defines three roles, each with a specific set of permissions:

| Role | `device:read` | `relay:toggle` | `user:manage` |
|---|:---:|:---:|:---:|
| **Admin** | ✅ | ✅ | ✅ |
| **Operator** | ✅ | ✅ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ |

- **`device:read`** — View device list and telemetry data.
- **`relay:toggle`** — Send relay ON/OFF commands to a device.
- **`user:manage`** — Register new users into the system.

Access is enforced by `rbacMiddleware.js` using the `requirePermission(action)` guard on each protected route.

---

## User Roles & Seeded Users

Running `node seed.js` creates the following default entries if they don't already exist:

### 👤 Users

| Name | Email | Password | Role |
|---|---|---|---|
| System Admin | `admin@anedya.io` | `password123` | **Admin** |

> ⚠️ **Change the default password immediately in any non-development environment.**

There is only **one seeded user** (the Admin). Additional users with `Operator` or `Viewer` roles must be created by an Admin via `POST /api/auth/register`.

### 📟 Devices

| Device ID | Name | Relay State |
|---|---|---|
| `test-device-001` | Main HVAC Unit | OFF |

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/anedya_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Anedya Cloud
ANEDYA_PROJECT_ID=your_anedya_project_id
ANEDYA_API_KEY=your_anedya_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- An Anedya Cloud account with a project and API key

### 1. Clone the repository

```bash
git clone https://github.com/PR-ODINSON/Anedya.git
cd Anedya
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment

Create `backend/.env` using the template in [Environment Variables](#environment-variables).

### 4. Seed the database

```bash
cd backend
node seed.js
```

This creates the default Admin user (`admin@anedya.io` / `password123`) and a test device.

### 5. Run the development servers

```bash
# Terminal 1 – Backend (runs on http://localhost:5000)
cd backend
npm run dev

# Terminal 2 – Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with `admin@anedya.io` / `password123`.

---

## Scripts

### Backend (`backend/`)

| Script | Command | Description |
|---|---|---|
| `dev` | `node server.js` | Start the development server |
| `start` | `node server.js` | Start in production mode |

### Frontend (`frontend/`)

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start the Vite dev server |
| `build` | `vite build` | Build for production |
| `preview` | `vite preview` | Preview the production build |
| `lint` | `eslint .` | Run ESLint |

---

> Built with ❤️ using [Anedya Cloud](https://anedya.io)
