import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { TelemetrySnapshot } from "./types";

/** Profiling snapshot for the diagnostics console. Authenticated users only. */
export const getTelemetrySnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<TelemetrySnapshot> => {
    const { snapshot } = await import("./store.server");
    return snapshot(200);
  });

export const clearTelemetry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<{ ok: true }> => {
    const { clearEvents } = await import("./store.server");
    clearEvents();
    return { ok: true };
  });