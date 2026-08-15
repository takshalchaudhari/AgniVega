/**
 * Capacitor config for the five Krishi-Yatra role apps.
 * Pick the app with APP_ROLE (farmer | driver | fleet | buyer | admin)
 * and point APP_URL at the deployed site, e.g.
 *   APP_ROLE=driver APP_URL=https://smartkrishiyatraa.noxverse.in npx cap sync android
 */
const APPS = {
  farmer: { appId: "in.noxverse.sky.farmer", appName: "Krishi-Yatra Farmer", start: "/farmer" },
  driver: { appId: "in.noxverse.sky.driver", appName: "Krishi-Yatra Driver", start: "/driver" },
  fleet: { appId: "in.noxverse.sky.fleet", appName: "Krishi-Yatra Fleet", start: "/fleet" },
  buyer: { appId: "in.noxverse.sky.buyer", appName: "Krishi-Yatra Buyer", start: "/buyer" },
  admin: { appId: "in.noxverse.sky.admin", appName: "Krishi-Yatra Admin", start: "/admin" },
};

const role = process.env.APP_ROLE || "farmer";
const app = APPS[role];
if (!app) throw new Error(`Unknown APP_ROLE "${role}". Use one of: ${Object.keys(APPS).join(", ")}`);

const origin = process.env.APP_URL || "https://smartkrishiyatraa.noxverse.in";

module.exports = {
  appId: app.appId,
  appName: app.appName,
  webDir: "dist/client",
  server: { url: `${origin}${app.start}`, androidScheme: "https", cleartext: false },
  android: { allowMixedContent: false, backgroundColor: "#ffffff" },
};
