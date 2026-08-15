/** Deterministic 5-minute demo scenario script (pure metadata, safe on client). */

export const DEMO_RUN = "DEMORUN";
export const DEMO_STEP_SECONDS = 22;

export type DemoStep = {
  index: number;
  key: string;
  actor: "system" | "farmer" | "driver" | "fleet" | "admin" | "buyer" | "ai";
  title: string;
  detail: string;
  screen: string;
};

export const DEMO_SCRIPT: DemoStep[] = [
  { index: 0, key: "reset", actor: "system", title: "Reset demo world", detail: "Clear the previous demo run and switch the platform into demo mode.", screen: "/admin/demo" },
  { index: 1, key: "farmer", actor: "farmer", title: "Farmer signs in", detail: "Demo farm Shivneri Farm, Shirur (Pune) is registered.", screen: "/farmer" },
  { index: 2, key: "crop-mandi", actor: "farmer", title: "Crop & mandi discovery", detail: "Tomato selected, mandi rates compared, Pune APMC chosen.", screen: "/farmer/market" },
  { index: 3, key: "shipment", actor: "farmer", title: "Shipment created", detail: "18 tonnes of tomato booked for today's harvest.", screen: "/farmer/new" },
  { index: 4, key: "optimize", actor: "system", title: "Route & cost optimisation", detail: "Distance, ETA, spoilage risk and pooled transport cost computed.", screen: "/farmer/new" },
  { index: 5, key: "vehicles", actor: "fleet", title: "Multiple vehicles allocated", detail: "18 t exceeds the 12 t legal limit, so two trucks are dispatched.", screen: "/fleet/vehicles" },
  { index: 6, key: "driver", actor: "driver", title: "Drivers accept", detail: "Both drivers accept and start the pickup leg.", screen: "/driver" },
  { index: 7, key: "gps", actor: "driver", title: "GPS tracking live", detail: "Pings streamed along the route, trips move to in-transit.", screen: "/driver/trips" },
  { index: 8, key: "admin", actor: "admin", title: "Admin control tower", detail: "Operations sees both trips, network health and the audit trail.", screen: "/admin/operations" },
  { index: 9, key: "listing", actor: "buyer", title: "Marketplace listing", detail: "Graded tomato listing published for buyers.", screen: "/buyer" },
  { index: 10, key: "order", actor: "buyer", title: "Buyer places order", detail: "12 t purchased at the live mandi rate, payment held in escrow.", screen: "/buyer/orders" },
  { index: 11, key: "delivery", actor: "driver", title: "Delivery completed", detail: "Both trips reach the mandi, farmer paid and driver payouts released.", screen: "/farmer/shipments" },
  { index: 12, key: "ai", actor: "ai", title: "Krishi Sathi AI summary", detail: "Sarvam AI (with a secondary model fallback) summarises the run in plain language.", screen: "/admin" },
  { index: 13, key: "done", actor: "system", title: "Run complete", detail: "Scorecard evidence recorded in the audit log.", screen: "/admin/demo" },
];

export const DEMO_TOTAL_SECONDS = DEMO_SCRIPT.length * DEMO_STEP_SECONDS;
