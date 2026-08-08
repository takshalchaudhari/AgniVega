# Smart Krishi-Yatra AI

> Built by **Team Agnivega** · Smart Kopargaon Hackathon 2026 (Problem Statement #041)

A voice-first, fuel-indexed agri-logistics platform designed to empower smallholder farmers across Kopargaon, Rahata, Shirdi, and Nashik.

## 🌟 Key Features

- **Voice-First Load Entry**: Multilingual support across 22 languages (including Marathi and Hindi) via Speech API.
- **Fuel-Indexed Freight Engine**: Real-time freight calculations indexed to local diesel rates (Nashik baseline ₹99.07/L).
- **Calculate-Then-Confirm Pooling**: Compare solo vs. pooled transport costs before booking.
- **Spoilage Clock**: Perishable produce transit countdown timer and financial risk metrics.
- **Triple-Fallback Routing**: OpenRouteService → OSRM → Offline Haversine geometry fallback.
- **Four Decoupled Portals**: Farmer, Driver Cockpit, Fleet Owner, and Admin Control Tower.

## 🚀 Quick Start

### Local Development

```sh
git clone https://github.com/takshalchaudhari/AgniVega.git
cd AgniVega
npm install
npm run dev
```

The application will start at `http://localhost:8080`.

### Production Build & Tests

```sh
npm run build
npx vitest run
```

## 🛠️ Built With

- **TanStack Start** (React 19 + SSR + Vite)
- **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL & Authentication)
- **Leaflet** (Interactive Routing & Live Maps)

