import { createServerFn } from "@tanstack/react-start";

export const setSystemMode = createServerFn({ method: "POST" })
  .inputValidator((d: { mode: "real" | "demo"; demoStatus?: "running" | "paused" | "stopped" }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { error } = await db
      .from("system_state")
      .update({
        mode: data.mode,
        demo_status: data.demoStatus ?? (data.mode === "demo" ? "running" : "stopped"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    await db.from("audit_logs").insert({
      actor: "system_admin",
      action: "system.mode",
      entity: "system_state",
      detail: `mode=${data.mode} status=${data.demoStatus ?? "auto"}`,
      dataset: data.mode,
    });
    return { ok: true, mode: data.mode };
  });
