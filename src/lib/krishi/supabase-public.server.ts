import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { recordEvent } from "@/lib/telemetry/store.server";
import { TELEMETRY_THRESHOLDS } from "@/lib/telemetry/types";

/**
 * Publishable-key Supabase client for public read-only reference data
 * (villages, mandis, crops, prices, vehicle types). RLS applies as `anon`.
 */
export function publicSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        const started = Date.now();
        const target = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        const label = `db:${new URL(target, url).pathname.replace("/rest/v1/", "")}`;
        return fetch(input, { ...init, headers }).then(
          (response) => {
            const durationMs = Date.now() - started;
            if (durationMs >= TELEMETRY_THRESHOLDS.slowQueryMs || !response.ok) {
              recordEvent({ kind: "query", name: label, durationMs, ok: response.ok, source: "server" });
            }
            return response;
          },
          (error: unknown) => {
            recordEvent({
              kind: "query",
              name: label,
              durationMs: Date.now() - started,
              ok: false,
              source: "server",
              detail: (error as Error).message,
            });
            throw error;
          },
        );
      },
    },
  });
}