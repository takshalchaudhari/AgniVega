import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant } from "@/lib/ai.functions";
import { useLang } from "@/lib/i18n";
import { Button, inputClass } from "@/components/ui-kit";
import type { Role } from "@/lib/roles";

type Msg = { role: "user" | "assistant"; content: string };

const SPEECH_LANG_MAP: Record<string, string> = {
  hi: "hi-IN",
  mr: "mr-IN",
  en: "en-IN",
  kn: "kn-IN",
  te: "te-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  bn: "bn-IN",
  pa: "pa-IN",
  ml: "ml-IN",
  or: "or-IN",
};

export function Assistant({ role }: { role: Role }) {
  const ask = useServerFn(askAssistant);
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [q, setQ] = useState("");
  const recognitionRef = useRef<any>(null);

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        lang === "hi"
          ? "नमस्ते! मुझसे बोलकर या लिखकर मंडी भाव, 12T भाड़ा या अपनी यात्रा के बारे में पूछें। 🎙️"
          : lang === "mr"
            ? "नमस्कार! मला बोलून किंवा लिहून बाजार भाव, वाहतूक खर्च किंवा फेरीबद्दल विचारा. 🎙️"
            : "Namaskar! Ask me by voice or text about mandi rates, 12T freight, or trip status. 🎙️",
    },
  ]);

  // Voice output function
  function speak(text: string) {
    if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_~`]/g, "").slice(0, 260);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = SPEECH_LANG_MAP[lang] ?? "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio speech ignored if blocked by browser autoplay
    }
  }

  // Voice input recognition setup
  function toggleListen() {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = SPEECH_LANG_MAP[lang] ?? "en-IN";
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => setListening(true);
      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setQ(transcript);
        if (event.results[0].isFinal) {
          rec.stop();
          setListening(false);
          void send(transcript);
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);

      recognitionRef.current = rec;
      rec.start();
    } catch {
      setListening(false);
    }
  }

  async function send(question: string) {
    if (!question.trim() || busy) return;
    const history = msgs;
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setQ("");
    setBusy(true);
    try {
      const res = await ask({ data: { question, role, lang, history } });
      setMsgs((m) => [...m, { role: "assistant", content: res.answer }]);
      speak(res.answer);
    } catch {
      const fallback = "Could not reach Krishi Sathi. Please check your connection.";
      setMsgs((m) => [...m, { role: "assistant", content: fallback }]);
      speak(fallback);
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
          {open ? "Close" : "Krishi Sathi Voice AI"}
        </span>
      </button>

      {/* Floating Chat & Voice Window */}
      {open && (
        <div className="absolute bottom-16 right-0 flex h-[500px] max-h-[78vh] w-[90vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌾</span>
              <div>
                <p className="text-xs font-bold leading-tight text-foreground">Krishi Sathi Voice AI</p>
                <p className="text-[10px] text-emerald-400 font-medium">Powered by Sarvam-105b & Voice Indic</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (speechEnabled) window.speechSynthesis?.cancel();
                  setSpeechEnabled(!speechEnabled);
                }}
                className="rounded-lg p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                title={speechEnabled ? "Mute voice reader" : "Enable voice reader"}
              >
                {speechEnabled ? "🔊" : "🔇"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-2.5 overflow-y-auto p-3 text-xs">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-none bg-primary px-3.5 py-2.5 text-primary-foreground font-medium"
                    : "w-fit max-w-[90%] rounded-2xl rounded-bl-none bg-muted px-3.5 py-2.5 leading-relaxed text-foreground"
                }
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="w-fit rounded-2xl rounded-bl-none bg-muted px-3.5 py-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span>Sarvam AI is responding in {lang.toUpperCase()}…</span>
              </div>
            )}
            {listening && (
              <div className="w-fit rounded-2xl rounded-bl-none bg-amber-500/20 border border-amber-500/40 px-3.5 py-2.5 text-[11px] text-amber-300 flex items-center gap-2 animate-pulse">
                <span>🎙️ Listening in {lang.toUpperCase()}... speak now</span>
              </div>
            )}
          </div>

          {/* Input Form with Voice Button */}
          <form
            className="flex items-center gap-2 border-t border-border bg-card/40 p-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send(q);
            }}
          >
            <button
              type="button"
              onClick={toggleListen}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
              }`}
              title="Speak to Krishi Sathi"
            >
              🎙️
            </button>
            <input
              className={`${inputClass} text-xs flex-1`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={listening ? "Listening..." : "Speak or type your question..."}
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
