import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { publicClient } from "./db.server";

type Msg = { role: "user" | "assistant"; content: string };

const askInputSchema = z.object({
  question: z.string().trim().min(1).max(300),
  role: z.enum(["farmer", "driver", "fleet", "buyer", "admin"]).default("farmer"),
  lang: z.enum(["en", "hi", "mr"]).default("en"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(400),
      }),
    )
    .max(6)
    .default([]),
});

// Server-side in-memory sliding window rate limiter (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

// Periodic cleanup of stale rate-limit records
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => askInputSchema.parse(data))
  .handler(async ({ data }) => {
    // 1. Extract client IP for rate limiting
    let clientIp = "anonymous";
    try {
      const req = getRequest();
      if (req?.headers) {
        clientIp =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          req.headers.get("cf-connecting-ip") ||
          "anonymous";
      }
    } catch {
      /* fallback to default */
    }

    // 2. Enforce Rate Limiting to prevent API billing exhaustion
    if (!checkRateLimit(clientIp)) {
      return {
        answer:
          data.lang === "hi"
            ? "आपने कम समय में कई प्रश्न पूछे हैं। कृपया 1 मिनट बाद पुनः प्रयास करें।"
            : data.lang === "mr"
              ? "आपण अल्पावधीत अनेक प्रश्न विचारले आहेत. कृपया 1 मिनिटानंतर पुन्हा प्रयत्न करा."
              : "You have sent several questions in a short period. Please wait a minute before asking again.",
        provider: "rate-limited" as const,
      };
    }

    // 3. Retrieve fresh grounded platform context
    const db = publicClient();
    const [{ data: crops }, { data: mandis }, { data: prices }] = await Promise.all([
      db.from("crops").select("name,season,perishability,base_price").limit(24),
      db.from("mandis").select("name,district").limit(8),
      db
        .from("market_prices")
        .select("price_per_quintal,recorded_on,crops(name),mandis(name)")
        .order("recorded_on", { ascending: false })
        .limit(40),
    ]);

    const context = [
      `Crops: ${(crops ?? []).map((c) => `${c.name} (${c.season}, ${c.perishability} perishability, base ₹${c.base_price}/qtl)`).join("; ")}`,
      `Mandis: ${(mandis ?? []).map((m) => `${m.name}, ${m.district}`).join("; ")}`,
      `Latest prices: ${(prices ?? [])
        .slice(0, 20)
        .map((p) => {
          const crop = p.crops as unknown as { name: string } | null;
          const mandi = p.mandis as unknown as { name: string } | null;
          return `${crop?.name ?? "crop"} at ${mandi?.name ?? "mandi"} ₹${p.price_per_quintal}`;
        })
        .join("; ")}`,
    ].join("\n");

    const system = `You are Krishi Sathi, the assistant inside the Smart Krishi-Yatra ${data.role} app for Indian farmers, drivers, fleet owners and buyers.
Answer in ${data.lang === "hi" ? "Hindi" : data.lang === "mr" ? "Marathi" : "simple English"}.
Be short (max 4-5 lines), practical and specific to crops, mandi prices, transport cost, spoilage risk and trip status.
Use only this live platform data when quoting numbers:\n${context}`;

    const sarvamKey = process.env["SARVAM_API_KEY"];
    const messages = [
      { role: "system", content: system },
      ...data.history.slice(-4),
      { role: "user", content: data.question },
    ];

    // 4. Primary Provider: Sarvam AI with bounded token budget
    if (sarvamKey) {
      try {
        const res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sarvamKey}`,
            "api-subscription-key": sarvamKey,
          },
          body: JSON.stringify({
            model: "sarvam-105b",
            messages,
            temperature: 0.2,
            max_tokens: 350, // Strict token cap to prevent budget drain
          }),
        });
        if (res.ok) {
          const json = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const answer = json.choices?.[0]?.message?.content;
          if (answer) return { answer, provider: "sarvam" as const };
        } else {
          console.error("Sarvam error", res.status, await res.text());
        }
      } catch (err) {
        console.error("Sarvam call failed", err);
      }
    }

    // 5. Fallback Secondary Provider with bounded token budget
    const gatewayKey = process.env["AI_GATEWAY_KEY"] || process.env["LOVABLE_API_KEY"];
    if (gatewayKey) {
      try {
        const gatewayUrl = process.env["AI_GATEWAY_URL"] || "https://ai.gateway.lovable.dev/v1/chat/completions";
        const res = await fetch(gatewayUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${gatewayKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages,
            max_tokens: 350,
          }),
        });
        if (res.status === 429)
          return {
            answer:
              data.lang === "hi"
                ? "अभी बहुत से प्रश्न पूछे जा रहे हैं — कृपया 1 मिनट बाद प्रयास करें।"
                : data.lang === "mr"
                  ? "सध्या खूप प्रश्न विचारले जात आहेत — कृपया 1 मिनिटानंतर पुन्हा प्रयत्न करा."
                  : "Too many questions right now — please try again in a minute.",
            provider: "rate-limited" as const,
          };
        if (res.status === 402)
          return {
            answer:
              data.lang === "hi"
                ? "AI सेवा अस्थायी रूप से अनुपलब्ध है।"
                : data.lang === "mr"
                  ? "AI सेवा तात्पुरती अनुपलब्ध आहे."
                  : "AI service quota temporarily reached. Please check back shortly.",
            provider: "no-credits" as const,
          };
        if (res.ok) {
          const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          const answer = json.choices?.[0]?.message?.content;
          if (answer) return { answer, provider: "fallback-ai" as const };
        } else {
          console.error("AI gateway error", res.status, await res.text());
        }
      } catch (err) {
        console.error("AI gateway call failed", err);
      }
    }

    // 6. Grounded Local Template Fallback (0 external calls, 0 cost)
    return {
      answer:
        data.lang === "hi"
          ? "सहायक अभी ऑफलाइन है, लेकिन ऐप पूरी तरह काम कर रहा है। आज के भाव 'मार्केट' स्क्रीन पर देखें।"
          : data.lang === "mr"
            ? "सहाय्यक सध्या ऑफलाइन आहे, परंतु ॲप पूर्णपणे कार्यरत आहे. आजचे भाव 'मार्केट' स्क्रीनवर पहा."
            : "The assistant is offline right now, but the app still works. Check today's prices on the Market screen and the risk note on your shipment.",
      provider: "unavailable" as const,
    };
  });
