import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/ai.functions";
import { useLang } from "@/lib/i18n";
import { Button, inputClass } from "@/components/ui-kit";
import type { Role } from "@/lib/roles";

type Msg = { role: "user" | "assistant"; content: string };

export function Assistant({ role }: { role: Role }) {
  const ask = useServerFn(askAssistant);
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        lang === "hi"
          ? "नमस्ते! मुझसे मंडी भाव, भाड़ा लागत या अपनी यात्रा के बारे में पूछें।"
          : lang === "mr"
            ? "नमस्कार! मला बाजार भाव, वाहतूक खर्च किंवा आपल्या फेरीबद्दल विचारा."
            : "Namaskar! Ask me about mandi prices, transport costs, spoilage risk, or your trip.",
    },
  ]);

  async function send(question: string) {
    if (!question.trim() || busy) return;
    const history = msgs;
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await ask({ data: { question, role, lang, history } });
      setMsgs((m) => [...m, { role: "assistant", content: res.answer }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: "Could not reach the assistant. Please try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-8 md:right-8">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("askAssistant")}
        className="group flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-xl transition hover:scale-105 active:scale-95"
      >
        <span className="text-xl">{open ? "✕" : "🎙️"}</span>
        <span className="hidden text-xs font-semibold sm:inline">
          {open ? "Close" : "Krishi Sathi AI"}
        </span>
      </button>

      {/* Floating Chat Window */}
      {open && (
        <div className="absolute bottom-16 right-0 flex h-[480px] max-h-[75vh] w-[90vw] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌾</span>
              <div>
                <p className="text-xs font-bold leading-tight text-foreground">Krishi Sathi</p>
                <p className="text-[10px] text-muted-foreground">Sarvam-105b Indic Agri AI</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 text-xs">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-none bg-primary px-3.5 py-2.5 text-primary-foreground"
                    : "w-fit max-w-[90%] rounded-2xl rounded-bl-none bg-muted px-3.5 py-2.5 leading-relaxed text-foreground"
                }
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="w-fit rounded-2xl rounded-bl-none bg-muted px-3.5 py-2.5 text-[11px] text-muted-foreground">
                <span className="animate-pulse">Thinking in {lang.toUpperCase()}…</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            className="flex items-center gap-2 border-t border-border bg-card/40 p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send(q);
            }}
          >
            <input
              className={`${inputClass} text-xs`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask about prices, freight, spoilage…"
            />
            <Button type="submit" disabled={busy || !q.trim()} className="shrink-0 text-xs px-3">
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
