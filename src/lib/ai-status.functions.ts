import { createServerFn } from "@tanstack/react-start";

export type AiStatus = {
  primary: { provider: "sarvam"; model: string; configured: boolean; reachable: boolean; detail: string };
  fallback: { provider: "fallback-ai"; model: string; configured: boolean; detail: string };
  active: "sarvam" | "fallback-ai" | "offline";
};

/**
 * Reports which AI provider Krishi Sathi will actually use.
 * Sarvam AI is the primary provider; the check confirms the key exists AND that
 * the endpoint answers a one-token probe. No key material is ever returned.
 */
export const getAiStatus = createServerFn({ method: "GET" }).handler(async (): Promise<AiStatus> => {
  const sarvamKey = process.env["SARVAM_API_KEY"];
  const gatewayKey = process.env["AI_GATEWAY_KEY"] || process.env["LOVABLE_API_KEY"];

  let reachable = false;
  let detail = "SARVAM_API_KEY is not configured — Krishi Sathi falls back to the secondary model.";

  if (sarvamKey) {
    detail = "SARVAM_API_KEY is configured but the probe did not answer.";
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
          messages: [{ role: "user", content: "Reply with the single word: ready" }],
          temperature: 0,
          max_tokens: 400,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const text = json.choices?.[0]?.message?.content?.trim();
        reachable = Boolean(text);
        detail = reachable
          ? `Sarvam AI (sarvam-105b) answered the probe: "${text?.slice(0, 40)}".`
          : "Sarvam AI answered but returned no text.";
      } else {
        detail = `Sarvam AI rejected the probe with HTTP ${res.status}. Check the API key.`;
      }
    } catch {
      detail = "Sarvam AI could not be reached from the server.";
    }
  }

  return {
    primary: {
      provider: "sarvam",
      model: "sarvam-105b",
      configured: Boolean(sarvamKey),
      reachable,
      detail,
    },
    fallback: {
      provider: "fallback-ai",
      model: "google/gemini-3.6-flash",
      configured: Boolean(gatewayKey),
      detail: gatewayKey ? "Secondary model ready if Sarvam is unavailable." : "No fallback model configured.",
    },
    active: reachable ? "sarvam" : gatewayKey ? "fallback-ai" : "offline",
  };
});
