# Android build guide — five role apps

Smart Krishi-Yatra ships as one codebase with five Android identities. Each role app opens
directly on its own route and hides the other role shells.

| App | Application ID | Start route | Theme |
| --- | --- | --- | --- |
| Krishi-Yatra Farmer | `in.noxverse.sky.farmer` | `/farmer` | Green |
| Krishi-Yatra Driver | `in.noxverse.sky.driver` | `/driver` | Blue |
| Krishi-Yatra Fleet | `in.noxverse.sky.fleet` | `/fleet` | Teal |
| Krishi-Yatra Buyer | `in.noxverse.sky.buyer` | `/buyer` | Amber/pink |
| Krishi-Yatra Admin | `in.noxverse.sky.admin` | `/admin` | Dark control tower |

## Status in this environment

APK compilation needs the Android SDK, Gradle and a JDK, plus an emulator or device for the
on-device navigation run. None of those exist inside the CI web sandbox, so **the five
APKs have not been compiled or installed here**. Everything else in the stack is verified in the
browser at mobile viewport (360–430 px), which is the same web layer the APK wraps.

## Building the APKs locally

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build

# repeat once per role, changing APP_ROLE
APP_ROLE=farmer npx cap add android
APP_ROLE=farmer npx cap sync android
cd android && ./gradlew assembleRelease
```

`capacitor.config.ts` reads `APP_ROLE` and emits the matching `appId`, `appName` and start URL:

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const role = process.env.APP_ROLE ?? "farmer";
const apps = {
  farmer: ["in.noxverse.sky.farmer", "Krishi-Yatra Farmer", "/farmer"],
  driver: ["in.noxverse.sky.driver", "Krishi-Yatra Driver", "/driver"],
  fleet: ["in.noxverse.sky.fleet", "Krishi-Yatra Fleet", "/fleet"],
  buyer: ["in.noxverse.sky.buyer", "Krishi-Yatra Buyer", "/buyer"],
  admin: ["in.noxverse.sky.admin", "Krishi-Yatra Admin", "/admin"],
} as const;
const [appId, appName, start] = apps[role as keyof typeof apps];

const config: CapacitorConfig = {
  appId,
  appName,
  webDir: "dist/client",
  server: { url: `https://<your-published-domain>${start}`, cleartext: false },
  android: { allowMixedContent: false },
};
export default config;
```

Signing: create one keystore, then set `MYAPP_UPLOAD_STORE_FILE` and friends in
`android/gradle.properties` before `assembleRelease`.

## On-device checklist (run after building)

1. Install all five APKs on the same device — confirm five separate launcher icons and names.
2. Open each app and confirm it lands on its own role home, with only that role's bottom navigation.
3. Farmer: create a shipment, edit the truck allocation, confirm booking.
4. Driver: accept a trip, step it to delivered, fire an SOS.
5. Fleet: check vehicles, drivers, maintenance.
6. Buyer: filter the market, place an order.
7. Admin: run the 5-minute demo and flip demo/real mode.
8. Rotate the device and re-check each screen at 360 px width.
