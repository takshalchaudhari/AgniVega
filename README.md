<div align="center">

<img src="docs/assets/hero.svg" alt="Smart Krishi-Yatra — market-aware agri-logistics OS" width="100%">

# 🌾 Smart Krishi-Yatra

**A market-aware agri-logistics operating system for Indian farm-to-mandi supply chains.**<br>
Five role apps · one database · one deterministic demo · one AI assistant in English / हिंदी / मराठी

<br>

<a href="https://smartkrishiyatraa.noxverse.in"><img alt="Live Demo" src="https://img.shields.io/badge/🚀_LIVE_DEMO-smartkrishiyatraa.noxverse.in-059669?style=for-the-badge&logo=rocket&logoColor=white"></a>
<a href="https://smartkrishiyatraa.noxverse.in/admin/demo"><img alt="14-Stage Demo" src="https://img.shields.io/badge/⚡_14--Stage_Demo-Jury_Proof-6366f1?style=for-the-badge"></a>
<img alt="stack" src="https://img.shields.io/badge/TanStack_Start-React_19-38bdf8?style=for-the-badge&logo=react&logoColor=white">
<img alt="db" src="https://img.shields.io/badge/PostgreSQL-RLS_enforced-336791?style=for-the-badge&logo=postgresql&logoColor=white">
<img alt="ai" src="https://img.shields.io/badge/AI-sarvam--105b-f59e0b?style=for-the-badge">

<br><br>

### 🔗 **[👉 Click Here to Launch Live Demo — smartkrishiyatraa.noxverse.in 👈](https://smartkrishiyatraa.noxverse.in)**

</div>

---

## 🎬 60-second jury path

| Step | Open | What it proves |
|---|---|---|
| 1 | `/` | Role hub — five independent product identities |
| 2 | `/admin/demo` → **Run full scenario** | Deterministic 14-stage farm→mandi→money run with a live evidence log |
| 3 | `/farmer/new` (18 t tomato) | Capacity engine splits the load, refuses >12 t per truck |
| 4 | `/admin` | Control tower: live trips, GPS trail, AI provider health, Demo/Real switch |
| 5 | Chat bubble (any screen) | Krishi Sathi answers with real rows from **your** dashboard, in 3 languages |

> Everything below is backed by code paths and database tables — file references are given so the technical jury can verify each claim in under a minute.

---

## 1. The problem, stated as a number

A farmer decides where to sell by looking at the **mandi price board**. That number is not the money that reaches the bank account.

```text
ENR  =  (mandi price × quantity)  −  freight  −  waiting/detention  −  spoilage(hours, temp, humidity)
        └─────── visible ───────┘    └────────────── invisible until after the trip ──────────────┘
```

Smart Krishi-Yatra computes **Expected Net Realization (ENR)** *before* the truck is booked, then keeps the whole chain — allocation, driver, GPS, delivery, payout — inside one auditable system.

<div align="center"><img src="docs/assets/allocation.svg" alt="18 t split into a 12 t and a 6 t truck with pooled savings" width="92%"></div>

---

## 2. Video walkthrough — real screens, real rows

<div align="center"><img src="docs/assets/allocator.gif" alt="Farmer planner splitting 18 t into a 12 t and a 6 t truck with live cost and pooling savings" width="88%"></div>

▶️ **[Full 45-second walkthrough (MP4)](docs/assets/walkthrough.mp4)** — screen-recorded against the running app, no slides, no mockups.

| Time | What you see | Proof |
|---|---|---|
| 0:00 | Role hub → Farmer dashboard | five independent role apps off one codebase |
| 0:08 | `/farmer/new` — tomato, **18 t**, Pune APMC | real crop + mandi rows from the database |
| 0:15 | Planner returns **MH13 EF 3302 · 12 t (100%)** + **MH15 CD 7702 · 6 t (75%)** | `allocateVehicles()` hard 12 t cap in action |
| 0:20 | Transport ₹1,439 · **pooling saves ₹1,035** · spoilage MEDIUM · you receive ₹2,37,961 | ENR computed before booking |
| 0:26 | Shipments → Driver → Fleet vehicles → Buyer marketplace | one shipment seen from four role perspectives |
| 0:38 | Admin control tower → operations → `/admin/demo` | live trips, audit trail, Demo ↔ Real switch |

---

## 3. System architecture

<details open>
<summary><b>🏗 Diagram — clients, server functions, engine, database (click to collapse)</b></summary>

```mermaid
flowchart LR
  subgraph Clients["5 role apps · web + mobile"]
    F["🌱 Farmer"]:::f
    D["🚚 Driver"]:::d
    L["🛠 Fleet"]:::l
    B["🛒 Buyer"]:::b
    A["🛰 Admin"]:::a
  end

  Clients -->|typed RPC| SF["createServerFn layer<br/>src/lib/*.functions.ts"]
  SF --> ENG["Logistics engine<br/>src/lib/logistics.ts"]
  SF --> AI["Krishi Sathi<br/>sarvam-105b → fallback → offline"]
  SF --> DB[("PostgreSQL · 24 tables<br/>RLS on every table")]
  SF --> DEMO["Demo orchestrator<br/>src/lib/demo-run.server.ts"]
  DEMO --> DB
  DB --> RT["Realtime dashboards"] --> Clients

  classDef f fill:#123c2a,stroke:#39d98a,color:#d7ffe9
  classDef d fill:#0d2233,stroke:#38bdf8,color:#dff2ff
  classDef l fill:#0b2b2f,stroke:#22d3ee,color:#dffaff
  classDef b fill:#2b1226,stroke:#f472b6,color:#ffe4f3
  classDef a fill:#111827,stroke:#94a3b8,color:#e5e7eb
```

</details>

<details>
<summary><b>📦 Runtime stack (click)</b></summary>

| Layer | Choice | Why |
|---|---|---|
| Framework | TanStack Start v1 (React 19, Vite 7) | file routes + server functions in one deploy unit |
| Server logic | `createServerFn` typed RPC | no hand-rolled REST, validated inputs, runs at the edge |
| Data | PostgreSQL + PostgREST, RLS on all 24 tables | authorization lives in the database, not in the UI |
| Styling | Tailwind v4, OKLCH tokens, 5 role skins | one design system, five visual identities |
| AI | `sarvam-105b` primary → secondary model → offline template | Indic-first reasoning, never a dead assistant |
| Edge / Cloud | Cloudflare Tunnel / Serverless edge | Global sub-second latency with automatic SSL |

</details>

---

## 4. The logistics engine (`src/lib/logistics.ts`)

<details open>
<summary><b>🔁 Diagram — trip state machine, 10 stages + incident branch (click to collapse)</b></summary>

```mermaid
stateDiagram-v2
  [*] --> OFFERED
  OFFERED --> ACCEPTED
  ACCEPTED --> EN_ROUTE_PICKUP
  EN_ROUTE_PICKUP --> AT_PICKUP
  AT_PICKUP --> LOADED
  LOADED --> IN_TRANSIT
  IN_TRANSIT --> AT_DROP
  AT_DROP --> DELIVERED
  DELIVERED --> COMPLETED
  COMPLETED --> [*]
  IN_TRANSIT --> INCIDENT: SOS / breakdown
  INCIDENT --> IN_TRANSIT
```

</details>

**Four deterministic functions, all unit-checkable:**

| Function | Rule |
|---|---|
| `roadDistanceKm(a,b)` | Haversine × road factor (1.28) — no external routing key required |
| `allocateVehicles(tons, km, fleet)` | greedy best-fit; **hard 12 t cap per vehicle**, allocation rejected otherwise |
| `poolSavings(allocations)` | shared-leg discount when trucks serve the same corridor |
| `spoilageRisk(priority, eta, humidity, temp)` | perishability curve → LOW / MEDIUM / HIGH + farmer-readable advice |

**Worked example, reproducible in the UI:** 18 t tomato, Shirur → Pune APMC (≈ 78 km) → `12 t + 6 t`, freight ₹18,540, pooling saving **₹1,035**, ETA 2 h 10 m, spoilage **LOW**.
Try to force 13 t onto one truck in `/farmer/new` — the planner blocks it and explains why.

---

## 5. The 14-stage deterministic demo (`src/lib/demo.ts`)

<details open>
<summary><b>📋 The 14 stages executed when you press "Run full scenario" in /admin/demo (click)</b></summary>

| Step | Stage | What gets written in the database |
|---|---|---|
| 0 | Reset | `system_state.demo_tick = 0`, active records wiped |
| 1 | Demand signal | Pune APMC buyer posts a 10 t tomato buy order at ₹1,450/qtl |
| 2 | Harvest declared | Farmer Ramesh posts 18 t tomato in Shirur |
| 3 | Capacity allocation | Engine allocates 2 vehicles under the 12 t limit (12 t + 6 t) |
| 4 | Trip offered | Trip created with status `OFFERED` to driver Santosh |
| 5 | Trip accepted | Driver accepts, status advances to `ACCEPTED` |
| 6 | En route pickup | Status `EN_ROUTE_PICKUP`, GPS ping written to `gps_pings` |
| 7 | Loading at farm | Status `AT_PICKUP`, farm-gate tare weight recorded |
| 8 | In transit & GPS trail | Status `IN_TRANSIT`, continuous telemetry stream logged |
| 9 | Quality inspection | Grade A verified, moisture 88%, shelf-life 5 days |
| 10 | Delivery at mandi | Status `DELIVERED`, buyer electronic sign-off |
| 11 | Buyer purchase | Buyer order matched to shipment, inventory cleared |
| 12 | Payout & escrow | Farmer balance credited ₹2,37,961; driver freight settled ₹17,505 |
| 13 | Final audit | Cryptographic hash sealed in `audit_logs` |

</details>

---

## 6. Security & data protection

| Control | Implementation |
|---|---|
| RLS | enabled on all 24 public tables, explicit `GRANT`s per role |
| Anonymous access | direct PostgREST reads of `drivers`, `orders`, `gps_pings`, `audit_logs`… return **401** |
| Demo PII | masked server-side in `src/lib/db.server.ts` (`demoReader()` + `safe()`) |
| Server functions | CSRF middleware, Zod-validated inputs, sliding-window rate limiting, bearer-auth middleware |

---

## 7. Krishi Sathi — the assistant

<details open>
<summary><b>🧠 Diagram — grounded answer path (click to collapse)</b></summary>

```mermaid
sequenceDiagram
  participant U as Farmer
  participant S as askAssistant() serverFn
  participant P as Postgres (role-scoped)
  participant M as sarvam-105b
  U->>S: "क्या मुझे आज बेचना चाहिए?"
  S->>P: fetch caller's shipments, mandi prices, weather
  P-->>S: grounded facts
  S->>M: system prompt + facts + question
  M-->>S: 2-sentence plain answer
  S-->>U: answer + provider badge (sarvam / fallback / offline)
```

</details>

The assistant is **grounded**: it only speaks about rows the caller is allowed to see, and `/admin` shows a live provider-health probe so the jury can confirm which model answered.

---

## 8. Repository map

```text
src/
  routes/            file-based routes — role screens, legal pages (terms, privacy, disclaimer, contact), __root
  lib/
    logistics.ts     distance · allocation · pooling · spoilage · state machine
    data.functions.ts   all dashboard reads + shipment/trip/order writes
    ai.functions.ts     Krishi Sathi (sarvam → fallback → offline, Zod & rate limiter)
    demo.ts / demo-run.server.ts / demo.functions.ts   14-stage scenario engine
    db.server.ts     demo reader + PII masking
    i18n.tsx         23 Indian languages (English, हिंदी, मराठी...)
    roles.ts         role identities & navigation
    error-reporting.ts  isolated telemetry & client error logger
  components/        ui-kit, app shell, assistant, footer
supabase/            schema + seed migrations
scripts/             build and utility scripts
docs/                verification scorecard, assets
```

---

## 9. Run locally

```bash
npm install
npm run dev            # http://localhost:8080
```

Environment variables (`.env`):
```env
SUPABASE_URL="https://vagpytfjcbrpufdveklg.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_JUF_s2bc-OFZTVodDubiwg_nKXdI2VT"
VITE_SUPABASE_URL="https://vagpytfjcbrpufdveklg.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_JUF_s2bc-OFZTVodDubiwg_nKXdI2VT"
SARVAM_API_KEY="optional_sarvam_key"
```

---

## 10. Instant Cloudflare Tunnel VPS Deployment (Zero Nginx / UFW config needed)

```bash
# 1. Install cloudflared on VPS
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# 2. Authenticate and create tunnel for smartkrishiyatraa.noxverse.in
cloudflared tunnel login
cloudflared tunnel create smartkrishi

# 3. Route domain through Cloudflare
cloudflared tunnel route dns smartkrishi smartkrishiyatraa.noxverse.in

# 4. Run app on VPS via PM2
pm2 start "npm run preview -- --port 3000 --host 127.0.0.1" --name "smartkrishi"

# 5. Start Cloudflare Tunnel service pointing to local port 3000
cloudflared tunnel run --url http://127.0.0.1:3000 smartkrishi
```

---

<div align="center">

**Live Platform:** <a href="https://smartkrishiyatraa.noxverse.in">smartkrishiyatraa.noxverse.in</a> · Engineered by **Team Agnivega** · Noxverse

</div>
