<div align="center">

<img src="docs/assets/hero.svg" alt="Smart Krishi-Yatra — market-aware agri-logistics OS" width="100%">

<h1>🌾 Smart Krishi-Yatra</h1>

<b>A market-aware agri-logistics operating system for Indian farm-to-mandi supply chains.</b><br>
Five role apps · one database · one deterministic demo · one AI assistant in English / हिंदी / मराठी

<br><br>

<a href="https://smartkrishiyatra.noxverse.in"><img alt="Live" src="https://img.shields.io/badge/LIVE-smartkrishiyatra.noxverse.in-39d98a?style=for-the-badge&logo=vercel&logoColor=white"></a>
<img alt="stack" src="https://img.shields.io/badge/TanStack_Start-React_19-38bdf8?style=for-the-badge&logo=react&logoColor=white">
<img alt="db" src="https://img.shields.io/badge/PostgreSQL-RLS_enforced-336791?style=for-the-badge&logo=postgresql&logoColor=white">
<img alt="ai" src="https://img.shields.io/badge/AI-sarvam--105b-f59e0b?style=for-the-badge">
<img alt="apps" src="https://img.shields.io/badge/Role_apps-5_web_%2B_5_Android_PWA-7ef2a8?style=for-the-badge">

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
  subgraph Clients["5 role apps · web + Android PWA"]
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
| Mobile | Capacitor wrapper per role (`scripts/build-android-apks.sh`) | five installable role apps from one codebase |

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
  DELIVERED --> COMPLETED --> [*]
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

## 5. The five applications

| App | Route | Core capability |
|---|---|---|
| 🌱 **Farmer** | `/farmer` | plan shipment, compare mandis, ENR preview, track trucks, wallet & settlement |
| 🚚 **Driver** | `/driver` | duty toggle, trip offers, 10-stage status machine, GPS pings, one-tap SOS |
| 🛠 **Fleet** | `/fleet` | vehicles, drivers, utilization, maintenance schedule, incident queue |
| 🛒 **Buyer** | `/buyer` | marketplace with grade/qty/mandi filters, price benchmark vs APMC, orders |
| 🛰 **Admin** | `/admin` | control tower, live map, audit log, network health, **Demo ↔ Real switch** |

Each app has its own colour system, navigation and Android package id (`src/lib/roles.ts`) — they read as five products, not five tabs.

---

## 6. Demo Mode — the proof engine

`/admin/demo` runs a **deterministic 14-stage scenario** (`src/lib/demo.ts`) that writes real rows tagged `dataset='demo'`:

<details open>
<summary><b>🗓 Diagram — the 14 demo stages (click to collapse)</b></summary>

```mermaid
timeline
  title 14-stage scenario · ~5 minutes
  Setup : reset world : farmer onboarded : crop & mandi compared
  Plan  : shipment created : route optimised : 2 vehicles allocated
  Move  : drivers accept : GPS streams : admin reviews live
  Money : listing published : buyer order : delivery : settlement
  Close : AI summary : audit closed
```

</details>


Every stage returns an **evidence string** (IDs, ₹ amounts, ping counts) rendered in a live log — so a judge sees the database changing, not a slideshow.

> **Demo vs Real isolation:** every operational table carries a `dataset` column. The global switch in `/admin/demo` decides what the platform serves; demo rows are read through a server-side reader that **masks PII** (phones → `••••1234`, owner ids stripped) before anything reaches the browser.

---

## 7. Security posture (verified, not claimed)

| Control | Implementation |
|---|---|
| Role storage | separate `user_roles` table + `has_role()` — never a column on `profiles` |
| Privilege escalation | sign-up metadata accepts only `farmer / driver / fleet / buyer`; admin is grant-only |
| RLS | enabled on all 24 public tables, explicit `GRANT`s per role |
| Anonymous access | direct PostgREST reads of `drivers`, `orders`, `gps_pings`, `audit_logs`… return **401** |
| Demo PII | masked server-side in `src/lib/db.server.ts` (`demoReader()` + `safe()`) |
| Server functions | CSRF middleware, Zod-validated inputs, bearer-auth middleware on protected calls |

15 baseline scan findings were remediated and re-verified — see `docs/` for the evidence report.

---

## 8. Krishi Sathi — the assistant

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

## 9. Repository map

```text
src/
  routes/            file-based routes — role screens, legal pages (terms, privacy, disclaimer, contact), __root
  lib/
    logistics.ts     distance · allocation · pooling · spoilage · state machine
    data.functions.ts   all dashboard reads + shipment/trip/order writes
    ai.functions.ts     Krishi Sathi (sarvam → fallback → offline)
    demo.ts / demo-run.server.ts / demo.functions.ts   14-stage scenario engine
    db.server.ts     demo reader + PII masking
    i18n.tsx         EN / HI / MR
    roles.ts         role identity, nav, Android package ids
    error-reporting.ts  isolated telemetry & client error logger
  components/        ui-kit, app shell, assistant, footer
supabase/            schema + seed migrations
scripts/             per-role Android APK build harness
docs/                verification scorecard, Android build guide, assets
```

---

## 10. Run it

```bash
npm install
npm run dev            # http://localhost:8080
```

Environment: database URL + publishable key, and optionally `SARVAM_API_KEY` for the primary AI provider (the assistant degrades gracefully without it).

Android (needs local JDK 17 + Android SDK):

```bash
APP_ROLE=farmer ./scripts/build-android-apks.sh
```

---

## 11. What is genuinely built vs. what is next

| Status | Item |
|---|---|
| ✅ Built & running | 5 role apps, 24-table schema with RLS, logistics engine, 14-stage demo, marketplace + escrow-style settlement, GPS trail, SOS, audit log, tri-lingual grounded AI, live domain |
| 🟡 Harness ready | Android APKs — Capacitor config + build script committed; compilation needs a local Android toolchain |
| 🔜 Next | live mandi price feeds via APMC APIs, driver reputation scoring, cold-chain IoT sensor ingest, UPI settlement rails |

<div align="center">

**Live:** <a href="https://smartkrishiyatra.noxverse.in">smartkrishiyatra.noxverse.in</a> · built by <b>Team Agnivega</b>

</div>
