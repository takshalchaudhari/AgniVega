import { DEMO_RUN, DEMO_SCRIPT } from "./demo";
import { allocateVehicles, etaMinutes, poolSavings, roadDistanceKm, spoilageRisk } from "./logistics";

export const SHIPMENT = `SHP-${DEMO_RUN}`;
export const FARM = `FRM-${DEMO_RUN}`;
export const LISTING = `LST-${DEMO_RUN}`;
export const ORDER = `ORD-${DEMO_RUN}`;
export const TRIP = (n: number) => `TRP-${DEMO_RUN}-${n}`;

export const CROP = "tomato";
export const MANDI = "apmc-pune";
export const TONS = 18;
export const ORIGIN = { lat: 18.827, lng: 74.373, district: "Pune" };

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

export async function wipe(db: Admin) {
  await db.from("gps_pings").delete().like("trip_id", `%${DEMO_RUN}%`);
  await db.from("trip_events").delete().like("trip_id", `%${DEMO_RUN}%`);
  await db.from("incidents").delete().like("trip_id", `%${DEMO_RUN}%`);
  await db.from("trips").delete().like("id", `%${DEMO_RUN}%`);
  await db.from("orders").delete().like("id", `%${DEMO_RUN}%`);
  await db.from("listings").delete().like("id", `%${DEMO_RUN}%`);
  await db.from("quality_reports").delete().like("shipment_id", `%${DEMO_RUN}%`);
  await db.from("shipments").delete().like("id", `%${DEMO_RUN}%`);
  await db.from("farms").delete().like("id", `%${DEMO_RUN}%`);
  await db.from("transactions").delete().like("note", `%${DEMO_RUN}%`);
  await db.from("notifications").delete().like("id", `%${DEMO_RUN}%`);
  await db.from("audit_logs").delete().like("entity", `%${DEMO_RUN}%`);
}

export async function aiSummary(facts: string) {
  const messages = [
    {
      role: "system",
      content:
        "You are Krishi Sathi, an agri-logistics assistant. Reply in 2 short plain-English sentences a farmer can understand.",
    },
    { role: "user", content: facts },
  ];
  const sarvam = process.env["SARVAM_API_KEY"];
  if (sarvam) {
    try {
      const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${sarvam}`,
          "api-subscription-key": sarvam,
        },
        // sarvam-105b is a reasoning model: it spends tokens on reasoning_content
        // before emitting content, so the output budget must be generous.
        body: JSON.stringify({ model: "sarvam-105b", messages, temperature: 0.2, max_tokens: 3000 }),
      });
      if (res.ok) {
        const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = j.choices?.[0]?.message?.content;
        if (text) return { provider: "sarvam-105b", text };
        console.error("Sarvam returned no content for the demo summary");
      } else {
        console.error("Sarvam demo summary failed", res.status, await res.text());
      }
    } catch (err) {
      console.error("Sarvam demo summary call failed", err);
    }
  }
  const gateway = process.env["AI_GATEWAY_KEY"] || process.env["LOVABLE_API_KEY"];
  if (gateway) {
    try {
      const gatewayUrl = process.env["AI_GATEWAY_URL"] || "https://ai.gateway.lovable.dev/v1/chat/completions";
      const res = await fetch(gatewayUrl, {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${gateway}` },
        body: JSON.stringify({ model: "google/gemini-3.6-flash", messages }),
      });
      if (res.ok) {
        const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = j.choices?.[0]?.message?.content;
        if (text) return { provider: "google/gemini-3.6-flash", text };
      }
    } catch {
      /* fall through */
    }
  }
  return { provider: "offline-template", text: facts };
}


type AnyDb = Admin;

/** Executes one scripted demo stage against a service-role client. */
export async function executeDemoStep(db: AnyDb, index: number) {
    const step = DEMO_SCRIPT[index];
  if (!step) throw new Error("Unknown demo step");
  let evidence = step.detail;

  if (step.key === "reset") {
    await wipe(db);
    await db
      .from("system_state")
      .update({ mode: "demo", demo_status: "running", demo_tick: 0, updated_at: new Date().toISOString() })
      .eq("id", 1);
    evidence = "Demo world reset and platform switched to demo mode.";
  }

  if (step.key === "farmer") {
    await db.from("farms").upsert({
      id: FARM,
      farmer_name: "Kisan Deshmukh",
      name: "Shivneri Farm",
      village: "Shirur",
      district: "Pune",
      state: "Maharashtra",
      lat: ORIGIN.lat,
      lng: ORIGIN.lng,
      area_acres: 9.5,
      dataset: "demo",
    });
    evidence = "Demo farmer Kisan Deshmukh (Shivneri Farm, Shirur) is ready.";
  }

  if (step.key === "crop-mandi") {
    const { data: prices } = await db
      .from("market_prices")
      .select("mandi_id, price_per_quintal, recorded_on")
      .eq("crop_id", CROP)
      .order("recorded_on", { ascending: false })
      .limit(20);
    const best = (prices ?? []).sort(
      (a, b) => Number(b.price_per_quintal) - Number(a.price_per_quintal),
    )[0];
    evidence = `Tomato compared across mandis — best listed rate ₹${best?.price_per_quintal ?? "—"}/qtl, Pune APMC selected for distance and capacity.`;
  }

  if (step.key === "shipment") {
    const { data: mandi } = await db.from("mandis").select("*").eq("id", MANDI).maybeSingle();
    const km = roadDistanceKm(ORIGIN, { lat: mandi!.lat, lng: mandi!.lng });
    const eta = etaMinutes(km, "high");
    await db.from("shipments").upsert({
      id: SHIPMENT,
      farm_id: FARM,
      crop_id: CROP,
      mandi_id: MANDI,
      quantity_tons: TONS,
      harvest_date: new Date().toISOString().slice(0, 10),
      quality_grade: "A",
      priority: "high",
      pooled: true,
      status: "created",
      distance_km: km,
      eta_minutes: eta,
      transport_cost: 0,
      pool_savings: 0,
      expected_amount: 0,
      payment_status: "held",
      dataset: "demo",
    });
    await db.from("quality_reports").upsert({
      id: `QR-${DEMO_RUN}`,
      shipment_id: SHIPMENT,
      grade: "A",
      moisture_pct: 11.4,
      notes: "Uniform size, no bruising",
      verified: true,
      dataset: "demo",
    });
    evidence = `Shipment ${SHIPMENT}: ${TONS} t tomato, ${km} km to Pune APMC, ETA ${Math.round(eta / 60)} h.`;
  }

  if (step.key === "optimize") {
    const { data: ship } = await db.from("shipments").select("*").eq("id", SHIPMENT).maybeSingle();
    const { data: weather } = await db
      .from("weather_snapshots")
      .select("*")
      .eq("district", "Pune")
      .order("recorded_on", { ascending: false })
      .limit(1)
      .maybeSingle();
    const risk = spoilageRisk("high", ship!.eta_minutes, weather?.humidity ?? 62, Number(weather?.temp_c ?? 31));
    await db.from("notifications").upsert({
      id: `NTF-${DEMO_RUN}-opt`,
      role: "farmer",
      title: "Route optimised",
      body: `${ship!.distance_km} km · spoilage risk ${risk.level}. ${risk.message}`,
      dataset: "demo",
    });
    evidence = `Optimised: ${ship!.distance_km} km, ETA ${ship!.eta_minutes} min, spoilage risk ${risk.level}.`;
  }

  if (step.key === "vehicles") {
    const { data: ship } = await db.from("shipments").select("*").eq("id", SHIPMENT).maybeSingle();
    const { data: vehicles } = await db.from("vehicles").select("*").eq("status", "available");
    const km = Number(ship!.distance_km);
    const { allocations } = allocateVehicles(TONS, km, vehicles ?? []);
    if (allocations.length < 1) throw new Error("No demo vehicles available");
    const savings = poolSavings(allocations);
    const cost = Math.max(0, allocations.reduce((s, a) => s + a.cost, 0) - savings);
    await db
      .from("shipments")
      .update({ status: "allocated", transport_cost: cost, pool_savings: savings })
      .eq("id", SHIPMENT);
    await db.from("trips").upsert(
      allocations.map((a, i) => ({
        id: TRIP(i + 1),
        shipment_id: SHIPMENT,
        vehicle_id: a.vehicle.id,
        status: "OFFERED",
        load_tons: a.tons,
        distance_km: km,
        eta_minutes: Number(ship!.eta_minutes),
        payout: Math.round(a.cost * 0.62),
        progress: 0,
        dataset: "demo",
      })),
    );
    evidence = `${allocations.length} vehicles allocated (12 t hard limit): ${allocations
      .map((a) => `${a.vehicle.reg_no} ${a.tons} t`)
      .join(", ")} · transport ₹${cost} after ₹${savings} pooling saving.`;
  }

  if (step.key === "driver") {
    const { data: drivers } = await db.from("drivers").select("*").limit(2);
    const { data: trips } = await db.from("trips").select("*").like("id", `%${DEMO_RUN}%`).order("id");
    let i = 0;
    for (const t of trips ?? []) {
      const drv = drivers?.[i % Math.max(1, drivers.length)];
      await db
        .from("trips")
        .update({ status: "EN_ROUTE_PICKUP", driver_id: drv?.id ?? null, progress: 0.22, started_at: new Date().toISOString() })
        .eq("id", t.id);
      await db.from("trip_events").insert([
        { trip_id: t.id, status: "ACCEPTED", note: "Driver accepted in the Driver app", dataset: "demo" },
        { trip_id: t.id, status: "EN_ROUTE_PICKUP", note: "Heading to the farm", dataset: "demo" },
      ]);
      i += 1;
    }
    evidence = `${trips?.length ?? 0} drivers accepted and are en route to the farm.`;
  }

  if (step.key === "gps") {
    const { data: trips } = await db.from("trips").select("*").like("id", `%${DEMO_RUN}%`).order("id");
    const dest = { lat: 18.4682, lng: 73.8578 };
    let pings = 0;
    for (const t of trips ?? []) {
      for (let s = 0; s <= 6; s += 1) {
        const f = s / 6;
        await db.from("gps_pings").upsert(
          {
            trip_id: t.id,
            vehicle_id: t.vehicle_id,
            lat: ORIGIN.lat + (dest.lat - ORIGIN.lat) * f,
            lng: ORIGIN.lng + (dest.lng - ORIGIN.lng) * f,
            speed_kmph: 38 + s,
            idempotency_key: `${t.id}-gps-${s}`,
            dataset: "demo",
          },
          { onConflict: "idempotency_key", ignoreDuplicates: true },
        );
        pings += 1;
      }
      await db.from("trips").update({ status: "IN_TRANSIT", progress: 0.55 }).eq("id", t.id);
      await db
        .from("trip_events")
        .insert({ trip_id: t.id, status: "IN_TRANSIT", note: "Loaded and moving", dataset: "demo" });
    }
    await db.from("shipments").update({ status: "in_transit" }).eq("id", SHIPMENT);
    evidence = `${pings} GPS pings streamed, both trips in transit.`;
  }

  if (step.key === "admin") {
    await db.from("audit_logs").insert({
      actor: "admin",
      action: "demo.review",
      entity: SHIPMENT,
      detail: "Control tower reviewed live trips, GPS trail and network health",
      dataset: "demo",
    });
    const { count } = await db
      .from("gps_pings")
      .select("*", { count: "exact", head: true })
      .like("trip_id", `%${DEMO_RUN}%`);
    evidence = `Admin control tower verified: shipment ${SHIPMENT}, ${count ?? 0} GPS pings, audit entry written.`;
  }

  if (step.key === "listing") {
    const { data: price } = await db
      .from("market_prices")
      .select("price_per_quintal")
      .eq("crop_id", CROP)
      .eq("mandi_id", MANDI)
      .order("recorded_on", { ascending: false })
      .limit(1)
      .maybeSingle();
    await db.from("listings").upsert({
      id: LISTING,
      shipment_id: SHIPMENT,
      crop_id: CROP,
      farm_id: FARM,
      mandi_id: MANDI,
      quantity_tons: TONS,
      price_per_quintal: Number(price?.price_per_quintal ?? 2200),
      grade: "A",
      available: true,
      dataset: "demo",
    });
    evidence = `Listing ${LISTING} published at ₹${price?.price_per_quintal ?? 2200}/qtl for ${TONS} t grade A tomato.`;
  }

  if (step.key === "order") {
    const { data: listing } = await db.from("listings").select("*").eq("id", LISTING).maybeSingle();
    const buyTons = 12;
    const total = Math.round(Number(listing!.price_per_quintal) * buyTons * 10);
    await db.from("orders").upsert({
      id: ORDER,
      buyer_name: "Sahyadri Fresh Foods",
      listing_id: LISTING,
      crop_id: CROP,
      quantity_tons: buyTons,
      total_amount: total,
      status: "confirmed",
      dataset: "demo",
    });
    await db
      .from("listings")
      .update({ quantity_tons: TONS - buyTons, available: true })
      .eq("id", LISTING);
    await db.from("transactions").insert({
      role: "buyer",
      kind: "debit",
      amount: total,
      note: `Order ${ORDER} (${DEMO_RUN})`,
      dataset: "demo",
    });
    evidence = `Order ${ORDER}: ${buyTons} t for ₹${total.toLocaleString("en-IN")} held in escrow.`;
  }

  if (step.key === "delivery") {
    const { data: trips } = await db.from("trips").select("*").like("id", `%${DEMO_RUN}%`);
    for (const t of trips ?? []) {
      await db
        .from("trips")
        .update({ status: "COMPLETED", progress: 1, completed_at: new Date().toISOString() })
        .eq("id", t.id);
      await db.from("trip_events").insert([
        { trip_id: t.id, status: "DELIVERED", note: "Unloaded at Pune APMC", dataset: "demo" },
        { trip_id: t.id, status: "COMPLETED", note: "Trip closed, payout released", dataset: "demo" },
      ]);
      await db.from("transactions").insert({
        role: "driver",
        kind: "credit",
        amount: Number(t.payout),
        note: `Trip payout ${t.id} (${DEMO_RUN})`,
        dataset: "demo",
      });
    }
    const { data: ship } = await db.from("shipments").select("*").eq("id", SHIPMENT).maybeSingle();
    const { data: order } = await db.from("orders").select("*").eq("id", ORDER).maybeSingle();
    const net = Math.round(Number(order?.total_amount ?? 0) - Number(ship?.transport_cost ?? 0));
    await db
      .from("shipments")
      .update({ status: "completed", payment_status: "paid", expected_amount: net })
      .eq("id", SHIPMENT);
    await db.from("orders").update({ status: "delivered" }).eq("id", ORDER);
    await db.from("transactions").insert({
      role: "farmer",
      kind: "credit",
      amount: net,
      note: `Settlement ${SHIPMENT} (${DEMO_RUN})`,
      dataset: "demo",
    });
    evidence = `Delivered. Farmer settled ₹${net.toLocaleString("en-IN")}, driver payouts released.`;
  }

  if (step.key === "ai") {
    const { data: ship } = await db.from("shipments").select("*").eq("id", SHIPMENT).maybeSingle();
    const { data: trips } = await db.from("trips").select("*").like("id", `%${DEMO_RUN}%`);
    const facts = `${TONS} tonnes of tomato went from Shirur to Pune APMC in ${trips?.length ?? 0} trucks over ${ship?.distance_km ?? 0} km. Transport cost ₹${ship?.transport_cost ?? 0} after pooling saved ₹${ship?.pool_savings ?? 0}, and the farmer received ₹${ship?.expected_amount ?? 0}.`;
    const summary = await aiSummary(facts);
    await db.from("notifications").upsert({
      id: `NTF-${DEMO_RUN}-ai`,
      role: "farmer",
      title: "Krishi Sathi summary",
      body: summary.text,
      dataset: "demo",
    });
    evidence = `AI (${summary.provider}): ${summary.text}`;
  }

  if (step.key === "done") {
    await db.from("audit_logs").insert({
      actor: "admin",
      action: "demo.complete",
      entity: SHIPMENT,
      detail: "5-minute demo scenario completed end to end",
      dataset: "demo",
    });
    await db.from("system_state").update({ demo_status: "paused" }).eq("id", 1);
    evidence = "Demo scenario complete — every stage recorded with demo-flagged records.";
  }

  await db
    .from("system_state")
    .update({ demo_tick: step.index, updated_at: new Date().toISOString() })
    .eq("id", 1);

  await db
    .from("system_state")
    .update({ demo_tick: step.index, updated_at: new Date().toISOString() })
    .eq("id", 1);

  return { step: step.index, key: step.key, title: step.title, evidence };
}
