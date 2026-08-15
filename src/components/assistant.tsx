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
    { role: "assistant", content: "Namaskar! Ask me about prices, transport cost or your trip." },
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
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("askAssistant")}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-lg md:bottom-6"
      >
        {open ? "×" : "🎙️"}
      </button>
      {open ? (
        <div className="fixed bottom-36 right-4 z-40 flex max-h-[65vh] w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl md:bottom-24">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Krishi Sathi</div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto w-fit max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-primary-foreground"
                    : "w-fit max-w-[90%] whitespace-pre-line rounded-2xl bg-muted px-3 py-2"
                }
              >
                {m.content}
              </div>
            ))}
            {busy ? <p className="text-xs text-muted-foreground">Thinking…</p> : null}
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send(q);
            }}
          >
            <input
              className={inputClass}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask about price, cost, trip…"
            />
            <Button type="submit" disabled={busy}>
              Ask
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
