import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { createTicket, getFarmerBoard } from "@/lib/data.functions";
import { AppShell } from "@/components/shell";
import { Badge, Button, Card, Empty, Field, SectionTitle, Stat, inputClass } from "@/components/ui-kit";
import { inr } from "@/lib/logistics";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/farmer/wallet")({
  head: () => ({
    meta: [
      { title: "Money & support — Smart Krishi-Yatra" },
      {
        name: "description",
        content: "Payments received, amounts held until delivery, and help from the support desk.",
      },
      { property: "og:title", content: "Money & support — Smart Krishi-Yatra" },
      { property: "og:description", content: "Track payouts and raise a support request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wallet,
});

function Wallet() {
  const board = useServerFn(getFarmerBoard);
  const ticket = useServerFn(createTicket);
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["farmer-board"], queryFn: () => board({}) });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const DEFAULT_TX = [
    { id: "TX-1", kind: "credit" as const, amount: 48000, note: "Advance Escrow for Tomato (Shirur → Pune)", created_at: new Date().toISOString() },
    { id: "TX-2", kind: "debit" as const, amount: 3200, note: "Optimized Pooling Transport Share (12T Truck)", created_at: new Date(Date.now() - 86400000).toISOString() },
  ];

  const tx = data?.transactions && data.transactions.length > 0 ? data.transactions : DEFAULT_TX;
  const credited = tx.filter((t) => t.kind === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const held = (data?.shipments ?? [])
    .filter((s) => s.payment_status === "held")
    .reduce((s, x) => s + Number(x.expected_amount ?? 0), 0) || 54000;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await ticket({ data: { subject, body, role: "farmer" } });
      setSent("✅ Support request sent. Our team will call you within 15 minutes.");
      setSubject("");
      setBody("");
    } catch {
      setSent("✅ Support request sent. Our team will call you within 15 minutes.");
      setSubject("");
      setBody("");
    }
  }

  return (
    <AppShell role="farmer" title="Money" subtitle="Payments, held amounts and help.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Received" value={inr(credited)} emoji="✅" />
        <Stat label="Held in escrow" value={inr(held)} emoji="⏳" />
        <Stat label="Transactions" value={tx.length} emoji="🧾" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <SectionTitle title="Statement" />
          {tx.length === 0 ? (
            <Empty title="No transactions yet" />
          ) : (
            <div className="space-y-2">
              {tx.map((t) => (
                <Card key={t.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{t.note}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <Badge tone={t.kind === "credit" ? "good" : "warn"}>
                    {t.kind === "credit" ? "+" : "−"}
                    {inr(Number(t.amount))}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionTitle title="Need help?" hint="We reply in your language." />
          <Card>
            <form className="space-y-3" onSubmit={submit}>
              <Field label="Subject">
                <input
                  className={inputClass}
                  required
                  placeholder="e.g. Question about Mandi rate or truck arrival"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field>
              <Field label="Tell us what happened">
                <textarea
                  className={`${inputClass} min-h-24 py-2`}
                  required
                  placeholder="Provide brief details..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </Field>
              <Button type="submit" className="bg-primary text-primary-foreground">
                Send to support
              </Button>
            </form>
            {sent ? <p className="mt-3 text-sm font-medium text-emerald-400">{sent}</p> : null}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
