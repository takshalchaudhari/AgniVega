import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = class NodeWebSocketStub {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSING = 2;
    static readonly CLOSED = 3;
    readonly readyState = 1;
    onopen = null;
    onclose = null;
    onerror = null;
    onmessage = null;
    send() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  };
}

const DEFAULT_SUPABASE_URL = "https://vagpytfjcbrpufdveklg.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_JUF_s2bc-OFZTVodDubiwg_nKXdI2VT";

/** Publishable-key client for server-side reads of public + simulated data. */
export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || DEFAULT_SUPABASE_KEY;
  const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || DEFAULT_SUPABASE_URL;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/**
 * Service-role reader used ONLY to serve the public demo dashboards.
 * Sensitive operational tables are no longer readable by the anon role, so the
 * demo screens go through this server-only path. Every caller MUST scope the
 * query to demo records with `.eq("dataset", "demo")` — never expose real
 * customer records through it, and strip personal fields with the helpers below.
 */
export async function demoReader() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const hide = (v: unknown, keep = 3) => {
  const s = String(v ?? "");
  return s ? `••••${s.slice(-keep)}` : "";
};

/** Remove/mask personal data before demo rows leave the server. */
export const safe = {
  driver: <T extends Record<string, any>>(r: T) => {
    const { user_id, license_expiry, ...rest } = r;
    return { ...rest, phone: hide(r['phone']), license_no: hide(r['license_no'], 4) };
  },
  drivers: <T extends Record<string, any>>(rows: T[] | null) => (rows ?? []).map(safe.driver),
  farms: <T extends Record<string, any>>(rows: T[] | null) =>
    (rows ?? []).map(({ owner_id, farmer_name, ...rest }) => rest),
  fleets: <T extends Record<string, any>>(rows: T[] | null) =>
    (rows ?? []).map(({ owner_id, contact, ...rest }) => rest),
  orders: <T extends Record<string, any>>(rows: T[] | null) =>
    (rows ?? []).map(({ buyer_id, ...rest }) => rest),
  incidents: <T extends Record<string, any>>(rows: T[] | null) =>
    (rows ?? []).map(({ reporter_id, ...rest }) => rest),
  userScoped: <T extends Record<string, any>>(rows: T[] | null) =>
    (rows ?? []).map(({ user_id, ...rest }) => rest),
  audit: <T extends Record<string, any>>(rows: T[] | null) =>
    (rows ?? []).map((r) => ({ ...r, actor: r['actor'] && String(r['actor']).length > 12 ? hide(r['actor'], 4) : r['actor'] })),
};
