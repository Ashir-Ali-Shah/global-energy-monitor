# 🌊 Ripple Effect — Global Energy & Conflict Monitor

A full-stack MERN application that visualizes **stock market fluctuations**, **petroleum prices**, and **natural gas prices** across an interactive global map, alongside real-time conflict and logistics alert monitoring.

![Architecture](https://img.shields.io/badge/Architecture-MERN-61DAFB?style=flat-square)
![SOLID](https://img.shields.io/badge/Principles-SOLID-blueviolet?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🏗️ Architecture

This project follows **SOLID principles** and **Separation of Concerns** with a layered backend architecture:

```
├── server/
│   ├── config/          # Database & environment configuration
│   ├── models/          # Mongoose schemas (GlobalAlert, EnergyPrice, SyncLog)
│   ├── repositories/    # Data access layer (MongoDB queries)
│   ├── services/        # Business logic (EIA & NewsData API clients)
│   ├── jobs/            # Cron-scheduled sync tasks (node-cron)
│   ├── controllers/     # HTTP request handlers
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Error handling
│   └── utils/           # Helpers (logger, coordinate mapping, sentiment)
├── client/
│   ├── src/
│   │   ├── components/  # React components (Map, Charts, Cards, Feed)
│   │   ├── hooks/       # Custom hooks (useAlerts, useEnergyPrices, useSyncStatus)
│   │   ├── services/    # API client layer
│   │   └── context/     # React Context for global state
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (default: `mongodb://localhost:27017`)

### Installation
```bash
# Install all dependencies (root + client)
npm run install:all
```

### Development
```bash
# Start both backend and frontend concurrently
npm run dev
```

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Production Build
```bash
npm run client:build
NODE_ENV=production npm run server
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all active alerts |
| GET | `/api/alerts/stats` | Alert statistics by category |
| GET | `/api/alerts/nearby?lng=&lat=&radius=` | Geospatial alert search |
| POST | `/api/alerts/sync` | Trigger manual NewsData sync |
| GET | `/api/energy/latest` | Latest commodity prices |
| GET | `/api/energy/history/:commodity` | Price history for charting |
| GET | `/api/energy/all` | All recent price data |
| POST | `/api/energy/sync` | Trigger manual EIA sync |
| GET | `/api/sync/status` | Sync status for all services |
| GET | `/api/sync/logs` | Recent sync activity logs |
| GET | `/api/health` | API health check |

## 🔄 Data Sync Strategy

Data is fetched from APIs and **stored in MongoDB** to avoid rate limits:

- **EIA API**: Syncs every **45 minutes** (petroleum, natural gas, crude oil prices)
- **NewsData.io**: Syncs every **45 minutes** (conflict, logistics, energy news)
- Initial sync runs on server startup
- Sync logs track history and prevent redundant API calls

## 🗂️ MongoDB Collections

- **GlobalAlert** — News/conflict alerts with GeoJSON coordinates and sentiment scores
- **EnergyPrice** — Time-series energy commodity price data from EIA
- **SyncLog** — Sync operation history for rate-limit management

## 🧰 Tech Stack

- **Frontend**: React 19, Vite, Mapbox GL JS, Recharts, Axios
- **Backend**: Node.js, Express 4, Mongoose 8, Winston, node-cron
- **Database**: MongoDB with 2dsphere geospatial indexes
- **APIs**: EIA API v2, NewsData.io API
- **Design**: Dark theme, glassmorphism, responsive layout

## 📜 License

MIT
