<div align="center">
  <img src="public/assets/readme_banner_3d.jpg" alt="Smart Krishi-Yatra AI Banner" width="100%" />

  <h1 align="center">Smart Krishi-Yatra AI</h1>
  
  <p align="center">
    <strong>Market-Aware Agricultural Logistics Operating System</strong><br/>
    Built for Maharashtra&#39;s smallholder farmers to maximize <strong>Expected Net Realization</strong>.
  </p>

  <p align="center">
    <a href="https://github.com/agnivega/smart-krishi-yatra-ai"><img src="https://img.shields.io/badge/Team-Agnivega-4b6845?style=for-the-badge&logo=github&logoColor=white" alt="Team Agnivega"></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
    <a href="https://tanstack.com/router/latest"><img src="https://img.shields.io/badge/TanStack-Router-FF4154?style=for-the-badge&logo=react&logoColor=white" alt="TanStack"></a>
  </p>
</div>

---

<div align="center">
  <h3><em>The highest mandi price is NOT necessarily the highest farmer realization.</em></h3>
</div>

If a farmer chases a high price far away, the transport cost and spoilage risk might wipe out their profits. Our system determines **WHERE, WHEN, and HOW** a farmer should transport their produce to ensure they take home the most money.

## 🚀 The Innovation: Expected Net Realization (ENR)

Our system replaces fragmented guesswork with a unified economic calculation:

> **MARKET + TRANSPORT + TIME + QUALITY + RISK → EXPECTED NET REALIZATION**

Everything in the platform supports calculating and optimizing for this singular metric.

### ✨ Key Components
| Component | Description |
| --------- | ----------- |
| 📈 **Price Engine** | Aggregates real-time crop pricing across mandis. |
| 🚛 **Deterministic CVRP Optimizer** | A capacity-constrained vehicle-routing heuristic that pools neighboring farmers&#39; loads to distribute freight costs efficiently. |
| ⏱️ **Transit & Queue Modeling** | Calculates dynamic transit times considering toll delays and APMC gate queues. |
| 🍎 **Spoilage Risk** | Dynamically discounts expected payout if a perishable crop approaches its spoilage threshold during transit. |
| 🎙️ **Voice Interface** | Allows rural farmers to interact using localized Marathi/Hindi voice commands and hear calculated ENRs without navigating a complex UI. |

## 🏗️ Technical Architecture

The platform operates using a tiered, offline-capable architecture suitable for rural connectivity environments.

*   **Frontend:** PWA built with React 19, TypeScript, and Vite.
*   **State Management:** TanStack Query & Router for robust, offline-tolerant data caching.
*   **Styling:** Tailwind CSS & Radix UI primitives with a modern glassmorphic 3D design system.
*   **Routing Engine (Tiered):**
    1.  *Tier 1 (Preferred)*: OSRM (Open Source Routing Machine) over network for precise road distance.
    2.  *Tier 2 (Fallback)*: Offline deterministic geospatial approximation (Haversine formula).
*   **Backend / Calculation Engine:** Server Functions via TanStack Start, executing complex routing and economic math without heavy client-side processing.

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/takshalchaudhari/AgniVega.git
   cd AgniVega
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will run on `http://localhost:5173`.*

4. **Testing (E2E and Unit):**
   ```bash
   npm run test
   
   npx playwright install
   npx playwright test
   ```

## 🌐 Demo Scenarios & Features

### 1. Farmer Portal
Farmers can input their crop, weight, and location. The engine instantly computes pooled transport options, evaluates spoilage risk, and ranks the output strictly by net realization.

### 2. Admin Scenario Injection
Logistics is volatile. Administrators can inject real-time delays (e.g., highway closures, vehicle breakdowns) into the system. The platform reacts by instantly recalculating transit times, escalating spoilage risks, and re-ranking the best mandi for the farmer to avert total loss.

## 📜 Disclaimer & Terminology

*   The routing algorithms provided in this prototype are based on a **Deterministic CVRP-based demonstration optimizer** using nearest-neighbor and 2-opt heuristics.
*   Any references to "AI" in the voice synthesis or predictive models reflect intended production integrations. The core economic model in this prototype relies on rigorous mathematical heuristics to ensure reliable, offline-capable execution.

## 📄 License & Third-Party Code

See [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md) for details on the open-source libraries, UI components, and geospatial systems used in this project.

