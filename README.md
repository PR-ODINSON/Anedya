<div align="center">

# 🌐 Anedya IoT Dashboard

**A production-grade, full-stack IoT monitoring and control platform**  
built on React 19 + Vite 8 (frontend) and Node.js + Express 5 (backend),  
integrating with the [Anedya Cloud](https://anedya.io) API.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [API Reference](#-api-reference)
- [Role-Based Access Control](#-role-based-access-control-rbac)
- [Frontend Pages & Components](#-frontend-pages--components)
- [State Management & Data Fetching](#-state-management--data-fetching)
- [Security Design](#-security-design)
- [Anedya Cloud Integration](#-anedya-cloud-integration)
- [Environment Variables](#-environment-variables)
- [Seeded Data](#-seeded-data)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Design Decisions & Technical Notes](#-design-decisions--technical-notes)

---

## 🔭 Overview

Anedya IoT Dashboard is a **startup-grade, production-ready** platform for monitoring and controlling IoT devices in real time. It acts as a secure middleware layer between your front-end users and the [Anedya Cloud](https://anedya.io) IoT backend — handling authentication, user roles, command routing, and telemetry visualization.

The system was designed with three principles in mind:
1. **Security first** — every route is protected; permissions are enforced at both the API and UI layers.
2. **Real-time feel** — SWR's stale-while-revalidate pattern keeps the UI fresh without constant full-page reloads.
3. **Developer ergonomics** — a rich seed script, nodemon hot-reload, and environment-configurable thresholds make local development seamless.

---

## ✨ Key Features

| Feature | Detail |
|---|---|
| 🔐 **JWT Authentication** | HttpOnly cookie-based JWTs — immune to XSS token theft |
| 🛡️ **Role-Based Access Control** | Three-tier permission system enforced on both API routes and React UI |
| 📡 **Real-Time Device Monitoring** | SWR polling every 10 s; optimistic UI updates for instant relay feedback |
| 📊 **Telemetry Charts** | Per-device, per-variable area charts with selectable time ranges (1 h / 6 h / 24 h) |
| 🔌 **Relay Control** | Toggle device relays with instant optimistic UI; auto-rollback on failure |
| 🔔 **Live Notifications** | Topbar bell auto-generates alerts from real device state (offline warnings, relay-on info) |
| 📥 **CSV Report Export** | One-click download of all device status data as a `.csv` file |
| 🔄 **Sync Data** | Manual SWR revalidation with animated feedback and success toast |
| 🧩 **Modular Architecture** | Clean separation of controllers, routes, middleware, services, models, hooks, and pages |
| 🔒 **Security Hardened** | Helmet.js headers, CORS whitelist, bcrypt password hashing, express-validator input sanitisation |
| 🌐 **Anedya Cloud** | Best-effort command dispatch with local DB fallback — dashboard works without live API credentials |
| 🌱 **Rich Seed Script** | Idempotent seeder with upsert logic — users always get password-reset; device timestamps always refresh |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React 19)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Dashboard │  │ Devices  │  │Telemetry │  │ Login/Unauth   │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│       └─────────────┴─────────────┘                │           │
│              useDevices (SWR global cache)          │           │
│              AuthContext (JWT + RBAC)               │           │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP + HttpOnly Cookie (JWT)
┌───────────────────────────▼─────────────────────────────────────┐
│                   Express 5 API Server (:5000)                  │
│                                                                 │
│  ┌─────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │  authRoutes │  │  deviceRoutes  │  │  /api/health         │  │
│  └──────┬──────┘  └───────┬────────┘  └──────────────────────┘  │
│         │                 │                                     │
│  ┌──────▼──────────────────▼───────────────────────────────┐    │
│  │  Middleware Stack                                        │    │
│  │  helmet → cors → cookieParser → protect → requirePerm   │    │
│  └──────────────────────────────┬──────────────────────────┘    │
│                                 │                               │
│  ┌──────────────────────────────▼──────────────────────────┐    │
│  │  Controllers                                             │    │
│  │  authController  │  deviceController                    │    │
│  └──────────────────────────────┬──────────────────────────┘    │
│                                 │                               │
│         ┌───────────────────────┴──────────────────────┐        │
│         ▼                                              ▼        │
│  ┌─────────────┐                          ┌───────────────────┐  │
│  │  MongoDB    │                          │  Anedya Cloud API │  │
│  │  (Atlas)    │                          │  (best-effort)    │  │
│  └─────────────┘                          └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle (Protected Route)

```
Browser → Cookie (JWT) → protect middleware (verify JWT, load User)
       → requirePermission(action) (check role permissions)
       → Controller → DB + Anedya Cloud → JSON response
```

---

## 🛠️ Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | HTTP server and router |
| `mongoose` | ^9.3.2 | MongoDB ODM with virtual fields |
| `jsonwebtoken` | ^9.0.3 | JWT signing and verification |
| `bcryptjs` | ^3.0.3 | Password hashing (salt factor 10) |
| `cookie-parser` | ^1.4.7 | HttpOnly cookie parsing |
| `helmet` | ^8.1.0 | Security HTTP headers |
| `cors` | ^2.8.6 | CORS with credential support |
| `express-validator` | ^7.3.1 | Request body validation |
| `axios` + `axios-retry` | ^1.13.6 / ^4.5.0 | Anedya Cloud API client with exponential backoff |
| `dotenv` | ^17.3.1 | Environment variable loading |
| `nodemon` | ^3.1.14 | Dev server hot-reload |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` + `react-dom` | ^19.2.4 | UI framework |
| `vite` | ^8.0.1 | Build tool and dev server |
| `react-router-dom` | ^7.13.2 | Client-side routing |
| `axios` | ^1.13.6 | HTTP API client |
| `swr` | ^2.4.1 | Stale-While-Revalidate data fetching |
| `recharts` | ^3.8.0 | Area charts for telemetry data |
| `lucide-react` | ^1.6.0 | Consistent icon library |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `tailwindcss` | ^4.2.2 | Utility-first CSS |
| `clsx` | ^2.1.1 | Conditional className utility |
| `tailwind-merge` | ^3.5.0 | Tailwind class deduplication |

---

## 📁 Project Structure

```
Anedya/
│
├── README.md
├── .gitignore
│
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── seed.js                    # Idempotent database seeder
│   ├── .env                       # Environment variables
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js              # Mongoose connection
│       │
│       ├── models/
│       │   ├── User.js            # User schema + password hashing hook
│       │   └── Device.js          # Device schema + isOnline virtual
│       │
│       ├── controllers/
│       │   ├── authController.js  # login, register, logout, profile
│       │   └── deviceController.js # getDevices, getDeviceTelemetry, toggleRelay
│       │
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT protect guard
│       │   └── rbacMiddleware.js  # Permission-based access control
│       │
│       ├── routes/
│       │   ├── authRoutes.js      # /api/auth
│       │   └── deviceRoutes.js    # /api/devices
│       │
│       ├── services/
│       │   └── anedyaService.js   # Anedya Cloud API singleton (with retry)
│       │
│       └── utils/
│           └── generateToken.js   # JWT creation + HttpOnly cookie setter
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx               # React DOM entry
        ├── App.jsx                # Router + AuthProvider root
        │
        ├── context/
        │   └── AuthContext.jsx    # Auth state, login/logout, hasRole, hasPermission
        │
        ├── hooks/
        │   └── useDevices.js      # SWR hook (10s polling, shared global cache)
        │
        ├── services/
        │   └── api.js             # Axios instance + 401/500 interceptors
        │
        ├── layouts/
        │   └── DashboardLayout.jsx # Sidebar + Topbar layout shell
        │
        ├── pages/
        │   ├── Login.jsx          # Login form with validation
        │   ├── Dashboard.jsx      # Overview: stat cards + charts + device cards
        │   ├── Devices.jsx        # Searchable device table + relay controls
        │   ├── Telemetry.jsx      # Per-device telemetry explorer with time ranges
        │   └── Unauthorized.jsx   # 403 error page
        │
        └── components/
            ├── DeviceCard.jsx     # Device status card with optimistic relay toggle
            ├── TelemetryChart.jsx # Recharts AreaChart wrapper
            ├── Sidebar.jsx        # Navigation with role-filtered links
            ├── Topbar.jsx         # Search + live notification bell + user menu
            ├── ProtectedRoute.jsx # Route guard (checks auth + optional roles)
            └── Skeleton.jsx       # Loading skeleton components
```

---

## 🗄️ Data Models

### `User`

```js
{
  name:      String   // required
  email:     String   // required, unique
  password:  String   // bcrypt hashed (salt=10) via pre-save hook
  role:      String   // enum: 'Admin' | 'Operator' | 'Viewer' — default: 'Viewer'
  isActive:  Boolean  // soft account disable — default: true
  createdAt: Date     // auto (timestamps)
  updatedAt: Date     // auto (timestamps)
}
```

**Key behaviour:**
- `pre('save')` hook: only re-hashes password when `isModified('password')` is true — safe for upsert operations.
- `matchPassword(entered)` instance method: `bcrypt.compare` for login verification.

### `Device`

```js
{
  deviceId:   String   // Anedya Cloud Node ID — required, unique
  name:       String   // Human display name — required
  lastSeen:   Date     // Last heartbeat timestamp — default: Date.now
  relayState: Boolean  // Current relay on/off state — default: false
  createdAt:  Date     // auto
  updatedAt:  Date     // auto

  // Virtual (not stored in DB)
  isOnline:   Boolean  // true if lastSeen < DEVICE_ONLINE_THRESHOLD_MS ago
}
```

**Key behaviour:**
- `toJSON: { virtuals: true }` — `isOnline` is serialised into every API response automatically.
- `DEVICE_ONLINE_THRESHOLD_MS` env var controls the threshold (default: 5 min). Set to `86400000` (24 h) in dev to prevent all devices appearing offline when no real IoT heartbeats are running.
- `lastSeen` is updated in the DB every time a relay command is issued, keeping device "presence" alive through human interactions.

---

## 📡 API Reference

All protected routes require a valid JWT in the `jwt` HttpOnly cookie (set on login).

### Auth — `/api/auth`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | Public | `{ email, password }` | Login; sets `jwt` HttpOnly cookie |
| `POST` | `/api/auth/logout` | Public | — | Clears `jwt` cookie |
| `GET` | `/api/auth/profile` | 🔒 Any | — | Returns logged-in user's `{_id, name, email, role}` |
| `POST` | `/api/auth/register` | 🔒 Admin | `{ name, email, password, role? }` | Creates a new user (Admin-only) |

**Validation (express-validator):**
- `login`: email must be valid; password required.
- `register`: name required; email valid; password min 6 chars.

### Devices — `/api/devices`

All device routes require authentication (`protect` middleware applied globally to the router).

| Method | Endpoint | Permission | Query/Body | Description |
|---|---|---|---|---|
| `GET` | `/api/devices` | `device:read` | — | Returns array of all devices (including `isOnline` virtual) |
| `GET` | `/api/devices/:id/telemetry` | `device:read` | `?variable=temperature&from=<ms>&to=<ms>` | Fetches telemetry from Anedya Cloud for a device |
| `POST` | `/api/devices/:id/relay` | `relay:toggle` | `{ state: boolean }` | Toggles relay; updates DB regardless of Anedya Cloud status |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns `{ status: 'ok', message: '...' }` |

---

## 🛡️ Role-Based Access Control (RBAC)

### Permission Matrix

| Permission | Admin | Operator | Viewer |
|---|:---:|:---:|:---:|
| `device:read` — view devices & telemetry | ✅ | ✅ | ✅ |
| `relay:toggle` — send relay ON/OFF commands | ✅ | ✅ | ❌ |
| `user:manage` — register new users | ✅ | ❌ | ❌ |

### How It Works — Backend

`rbacMiddleware.js` defines a static `rolePermissions` map. `requirePermission(action)` is a higher-order function that returns an Express middleware:

```js
// Applied per route, e.g.:
router.post('/:id/relay', requirePermission('relay:toggle'), toggleRelay);
```

`protect` middleware (authMiddleware.js) runs first — verifies the JWT, loads the full user from MongoDB, and attaches it to `req.user`. Only then does RBAC run.

### How It Works — Frontend

`AuthContext.jsx` mirrors the same `rolePermissions` map client-side. Components call:

```js
const { hasPermission } = useAuth();
if (hasPermission('relay:toggle')) { /* show toggle */ }
```

This hides UI elements for roles that can't act — but backend enforcement is always the authoritative guard.

### Navigation Filtering

`Sidebar.jsx` filters nav items by `requiredRoles`. Items with `requiredRoles: ['admin']` (e.g. Users, Settings) are hidden from Operator and Viewer roles.

---

## 🖥️ Frontend Pages & Components

### Pages

#### `/` — Dashboard
- **Stat cards**: Total Devices, Active Devices (isOnline count), Offline Devices — all computed live from SWR data.
- **Sync Data button**: Triggers SWR `mutate()`, shows "Syncing…" spinner + success toast.
- **Generate Report button**: Downloads a `.csv` file containing all device data; briefly switches to "Downloaded!" state.
- **Overview charts**: Two `TelemetryChart` instances rendered with 24-point mock data (temperature + power) — replaced with Anedya Cloud data once API key is configured.
- **Device Status panel**: Renders `DeviceCard` for each device; relay toggles immediately revalidate SWR so stat cards recount.

#### `/devices` — Device Management
- Searchable, filterable table of all registered devices.
- **Columns**: Device icon, Name, Device ID (monospace badge), Status (Online/Offline), Relay (ON/OFF badge), Last Seen (relative time: "2 m ago").
- Per-row **Turn ON / Turn OFF** button — visible only to Admin and Operator; disables while the API call is in-flight.
- Footer shows "Showing X of Y devices" count.

#### `/telemetry` — Telemetry Explorer
- **Device selector**: Dropdown populated from the live device list.
- **Variable selector**: Temperature (°C), Humidity (%), Power (kW), Voltage (V).
- **Time range selector**: Last 1 h, Last 6 h, Last 24 h.
- **Per-device deterministic mock data**: Uses a `mulberry32` seeded PRNG keyed on each device's MongoDB `_id` — each device always shows a unique, stable-but-realistic curve. Data regenerates on selector change or "Refresh Data" click.
- **Stat bar**: Min / Avg / Max computed from current chart data.
- Hint note: "Showing mock data — configure Anedya API key for live data."

#### `/login` — Login
- Email + password form with client-side validation.
- On success, stores user in `AuthContext` and redirects to dashboard.
- HTTP 401 displays inline error message.

#### `/unauthorized` — 403 Page
- Shown when a user tries to access a route their role doesn't permit.

### Components

| Component | Description |
|---|---|
| `DeviceCard` | Glassmorphism card with status glow, relay state pill, optimistic toggle. `useEffect` syncs relay state from props — ensures cross-page consistency when SWR cache updates. |
| `TelemetryChart` | `recharts` `AreaChart` with gradient fill inside a fixed `h-72` container and `minWidth={0}` to avoid the `-1` size warning. |
| `Topbar` | Search bar, live notification bell, user info, logout. Bell reads live device data to build alerts (offline warnings, active relay info). Notifications are individually or bulk-dismissible. |
| `Sidebar` | `NavLink`-based navigation with active state styling. Filters items by `requiredRoles` using `hasRole()`. |
| `ProtectedRoute` | Wraps routes; redirects unauthenticated users to `/login` and unauthorised roles to `/unauthorized`. |
| `Skeleton` / `DeviceCardSkeleton` | Pulse-animated placeholders rendered during initial SWR data load. |

---

## ⚡ State Management & Data Fetching

### SWR — Global Cache Architecture

All device data flows through a single SWR instance keyed on `'/devices'`:

```js
// hooks/useDevices.js
const { data, error, isLoading, mutate } = useSWR('/devices', fetcher, {
    refreshInterval: 10000,    // background poll every 10 s
    revalidateOnFocus: true,   // revalidate when user returns to tab
    shouldRetryOnError: true,
    errorRetryCount: 3
});
```

**Why this matters:** Both `Dashboard` and `Devices` use `useDevices()`. SWR's global cache means they share the **same data object**. Calling `mutate()` in one component immediately re-renders all consumers. This is how relay toggles on the Devices page instantly update the stat cards on the Dashboard without any prop drilling or event bus.

### Optimistic UI

`DeviceCard` implements optimistic relay toggling:
1. Flip `localRelay` state immediately (user sees instant feedback).
2. Issue `POST /api/devices/:id/relay` in the background.
3. On success → call `onRelayChange()` (parent's `mutate()`) to sync from server.
4. On failure → rollback `localRelay` + show error toast.

### AuthContext

Wraps the entire app. On mount, silently calls `GET /api/auth/profile` using the existing cookie — if valid, user is restored without a login page. Provides:
- `user` — current user object `{ _id, name, email, role }`
- `login(email, password)` — POST to backend, update state
- `logout()` — POST to backend, clear state
- `hasRole(roles[])` — checks role membership
- `hasPermission(action)` — checks permission by role

---

## 🔒 Security Design

| Layer | Mechanism |
|---|---|
| **Token storage** | HttpOnly cookie — inaccessible to JavaScript; immune to XSS |
| **Token transport** | `withCredentials: true` on all Axios requests; `credentials: true` on CORS |
| **CORS** | Whitelisted to `FRONTEND_URL` only — rejects all other origins |
| **Headers** | `helmet()` sets `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, CSP, etc. |
| **Password storage** | `bcryptjs` with salt factor 10 per password |
| **Input validation** | `express-validator` on all mutation routes |
| **Route protection** | Every API route (except `/login`, `/logout`, `/health`) requires `protect` middleware |
| **Authorisation** | `requirePermission(action)` on per-route basis after authentication |
| **Expired tokens** | JWT `TokenExpiredError` handled explicitly — returns 401 with clear message |

---

## ☁️ Anedya Cloud Integration

`anedyaService.js` is a **singleton** class that wraps the Anedya REST API:

```js
// Region-aware base URL
this.baseURL = `https://api.${this.region}.anedya.io/v1`;
```

**Methods:**
- `getDeviceData(nodeId, variable, from, to)` — fetch historical telemetry.
- `sendCommand(nodeId, commandId, payload)` — dispatch a relay command.

**Retry logic** (via `axios-retry`):
- 3 retries with exponential backoff.
- Retries on network errors or HTTP 5xx responses.

**Best-effort command dispatch** (key design decision):  
`toggleRelay` controller wraps the Anedya call in its own `try/catch`. If Anedya is unreachable (e.g. missing API key in dev), a `[WARN]` is logged server-side and the local DB state is **still updated**. The dashboard always reflects the DB state — making development possible without live IoT credentials.

---

## 🌱 Environment Variables

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/anedya-iot

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d

# Anedya Cloud
ANEDYA_API_KEY=your_anedya_api_key
ANEDYA_REGION=ap-in-1

# CORS
FRONTEND_URL=http://localhost:5173

# Device online threshold
# DEV:  86400000 (24 h) — seeded devices stay "online" without real heartbeats
# PROD: 300000   (5 min) — real IoT devices send regular heartbeats
DEVICE_ONLINE_THRESHOLD_MS=86400000
```

> ⚠️ Never commit `.env` to version control. It is listed in `.gitignore`.

---

## 🌱 Seeded Data

Run `npm run seed` from `backend/` to initialise or refresh the database.

### Users (always upserted — passwords reset on every run)

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | System Admin | `admin@anedya.io` | `Admin@1234` |
| **Operator** | Raj Mehta | `raj.mehta@anedya.io` | `Operator@1234` |
| **Viewer** | Priya Singh | `priya.singh@anedya.io` | `Viewer@1234` |

> Additional users can be created by Admin via `POST /api/auth/register`.

### Devices (lastSeen always refreshed on re-seed — keeps online status accurate)

| Device ID | Name | Default Status | Relay |
|---|---|---|---|
| `node-hvac-001` | Main HVAC Unit — Floor 1 | 🟢 Online | ON |
| `node-hvac-002` | HVAC Backup Unit — Floor 2 | 🟢 Online | OFF |
| `node-pump-001` | Water Pump — Rooftop | 🟢 Online | ON |
| `node-gen-001` | Generator Controller — Basement | 🟢 Online | OFF |
| `node-light-001` | Smart Lighting — Lobby | 🔴 Offline | OFF |
| `node-sensor-temp-001` | Temperature Sensor — Server Room | 🟢 Online | OFF |
| `node-gate-001` | Gate Access Controller — Main Entry | 🔴 Offline | OFF |
| `node-ups-001` | UPS Monitor — Data Center | 🟢 Online | ON |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** — Atlas cluster (free tier works) or local instance
- **Anedya Cloud** account (optional for development — dashboard works with mock data)

### 1. Clone

```bash
git clone https://github.com/PR-ODINSON/Anedya.git
cd Anedya
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the environment template and fill in your values:

```bash
# Create .env manually using the template above
```

### 3. Seed the database

```bash
npm run seed
```

Output will confirm users and devices created/refreshed.

### 4. Frontend setup

```bash
cd ../frontend
npm install
```

### 5. Run development servers

```bash
# Terminal 1 — Backend (nodemon, auto-reloads on file changes)
cd backend && npm run dev

# Terminal 2 — Frontend (Vite HMR)
cd frontend && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |

### 6. Login

Use any of the seeded accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@anedya.io` | `Admin@1234` |
| Operator | `raj.mehta@anedya.io` | `Operator@1234` |
| Viewer | `priya.singh@anedya.io` | `Viewer@1234` |

---

## 📜 Available Scripts

### Backend (`backend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload on change) |
| `npm start` | Start with plain node (production) |
| `npm run seed` | Run the database seeder |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the src tree |

---

## 🧠 Design Decisions & Technical Notes

### Why HttpOnly cookies instead of localStorage for JWT?
`localStorage` is readable by any JavaScript — including injected scripts (XSS attacks). HttpOnly cookies are invisible to JavaScript entirely. Combined with `SameSite: strict` and HTTPS-only in production (`secure: true`), this is the most hardened token storage strategy available for web applications.

### Why SWR instead of React Query or Redux?
SWR's global cache architecture is ideal here — `useDevices()` is called from three components (Dashboard, Devices, Topbar notifications), and they all automatically share the same server state. Calling `mutate()` anywhere invalidates all three simultaneously. The footprint is also minimal compared to Redux for this size of app.

### Why is the relay toggle "best-effort" against Anedya Cloud?
In a development environment without a real Anedya API key, a direct `await anedyaService.sendCommand(...)` would throw and return HTTP 500, making the relay button non-functional. By decoupling the cloud call from the DB update, the local state (which drives the UI) always updates correctly. In production, real IoT devices will pick up commands from Anedya Cloud directly.

### Why a seeded PRNG for telemetry mock data?
`Math.random()` changes every render cycle, causing `useMemo` dependency comparison to miss updates and Recharts to re-animate unnecessarily. The `mulberry32` PRNG seeded with each device's MongoDB `_id` ensures:
- **Same device → same curve** (stable between page loads)
- **Different devices → different curves** (realistic separation)
- **Refresh click → fresh curve** via a `refreshKey` state integer

### Why `DEVICE_ONLINE_THRESHOLD_MS` in `.env`?
The isOnline virtual is a pure function of `lastSeen`. Without real IoT heartbeats, seeded devices flip to "offline" within 5 minutes of seeding. Rather than lowering code quality with a hardcoded long timeout, the threshold is externalised to `.env` — set `86400000` (24 h) in dev, `300000` (5 min) in prod — a clean, environment-aware solution.

### `useEffect` in DeviceCard for relay state sync
`useState(initialValue)` in React only reads `initialValue` on the component's **first mount**. Without `useEffect(() => setLocalRelay(relayState), [relayState])`, toggling a relay on the Devices page would update the SWR cache but the Dashboard's DeviceCards would keep showing the stale local state. The effect ensures any server-driven prop change is reflected in the card's local UI.

---

<div align="center">

Built with ❤️ for the [Anedya](https://anedya.io) ecosystem.

</div>
