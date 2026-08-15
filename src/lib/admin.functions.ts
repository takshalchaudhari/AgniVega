import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const setSystemMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mode: "real" | "demo"; demoStatus?: "running" | "paused" | "stopped" }) => d)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Only an administrator can change the system mode");

    const { error } = await supabase
      .from("system_state")
      .update({
        mode: data.mode,
        demo_status: data.demoStatus ?? (data.mode === "demo" ? "running" : "stopped"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      actor: userId,
      action: "system.mode",
      entity: "system_state",
      detail: `mode=${data.mode} status=${data.demoStatus ?? "auto"}`,
      dataset: data.mode,
    });
    return { ok: true, mode: data.mode };
  });
