import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, planFor, type PlanId } from "@/lib/plans";
import { getUsage } from "@/lib/exam.functions";
import { Check, Loader2, Sparkles, Zap, Award, Gift, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({ meta: [{ title: "Academic Plans — Lumio" }] }),
  component: Billing,
});

const BETA_PLANS: Record<PlanId, { name: string; price: string; priceNote: string; badge: string; features: string[] }> = {
  free: {
    name: "Standard Learner",
    price: "Free",
    priceNote: "for all students",
    badge: "Basic access",
    features: [
      "5 AI learning lessons / month",
      "Up to 10 questions per exam",
      "Unlimited manual study decks",
      "Upload notes up to 25 MB",
    ],
  },
  pro: {
    name: "Academic Pro",
    price: "Unlocked via Streak",
    priceNote: "or free in Early Beta",
    badge: "Most Popular",
    features: [
      "100 AI learning lessons / month",
      "Up to 30 questions per practice exam",
      "High-speed priority AI generation",
      "Custom voice tutoring voice synthesis support",
    ],
  },
  unlimited: {
    name: "Mastery Contributor",
    price: "Unlocked via Library",
    priceNote: "or free in Early Beta",
    badge: "Infinite Access",
    features: [
      "1,000 AI learning lessons / month",
      "Up to 50 questions per exam",
      "Long-form comprehensive mock runs (timed)",
      "Upload books directly to Lumio Public Library",
    ],
  },
};

function Billing() {
  const qc = useQueryClient();
  const { data: usage, isLoading } = useQuery({
    queryKey: ["ai-usage"],
    queryFn: () => getUsage(),
  });
  const [switching, setSwitching] = useState<PlanId | null>(null);

  const currentPlan = planFor(usage?.plan);
  const pct =
    usage && usage.limit > 0 ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0;

  const upgrade = async (id: PlanId) => {
    setSwitching(id);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setSwitching(null);
      return toast.error("Please sign in first");
    }
    const { error } = await supabase.from("profiles").update({ plan: id }).eq("id", u.user.id);
    setSwitching(null);
    if (error) return toast.error(error.message);
    toast.success(`Successfully activated "${BETA_PLANS[id].name}" plan!`);
    qc.invalidateQueries({ queryKey: ["ai-usage"] });
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Top Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-widest">
          <Gift className="h-4 w-4 text-primary animate-bounce" />
          <span>Lumio Beta Contributor Program</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Plan & Credits</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Lumio is currently in Open Beta. All cash transactions and subscription prices have been fully waived to maximize academic access. Switch between plans below free of charge!
        </p>
      </header>

      {/* Usage Analytics card */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground">Active Plan State</span>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-foreground">
                {BETA_PLANS[usage?.plan as PlanId ?? "free"]?.name || "Standard Learner"}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 animate-pulse">
                Active & Free
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Early adopter pricing waived forever. Thank you for contributing.
            </p>
          </div>

          <div className="md:w-80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-primary" /> AI Usage Credits
              </span>
              <span className="font-bold text-foreground">
                {isLoading ? "Loading..." : `${usage?.used ?? 0} / ${usage?.limit ?? 0}`}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">Usage quotas reset on the 1st of every month</p>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Select Learning Tier</h2>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Award className="h-4 w-4 text-primary" /> Plans are unlockable or instantly grantable
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(Object.keys(BETA_PLANS) as PlanId[]).map((id) => {
            const p = BETA_PLANS[id];
            const current = (usage?.plan ?? "free") === id;
            const isHighlight = id === "pro";

            return (
              <div
                key={id}
                className={`relative rounded-3xl border bg-card p-6 flex flex-col justify-between transition-all duration-300 ${
                  isHighlight
                    ? "border-primary/60 shadow-[0_4px_30px_-6px_rgba(59,130,246,0.2)] scale-[1.01]"
                    : "border-border shadow-elev-1 hover:border-primary/30"
                }`}
              >
                {/* Special Top Badge */}
                {isHighlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary text-primary-foreground shadow-elev-2 animate-bounce">
                    <Sparkles className="h-3 w-3" /> {p.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{p.name}</h3>
                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-foreground tracking-tight">{p.price}</span>
                      <span className="text-xs text-muted-foreground">{p.priceNote}</span>
                    </div>
                  </div>

                  <hr className="border-border/60" />

                  <ul className="space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground leading-normal">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    disabled={current || switching === id}
                    onClick={() => upgrade(id)}
                    className={`ripple w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                      current
                        ? "bg-secondary text-muted-foreground cursor-default border border-transparent"
                        : isHighlight
                          ? "bg-primary text-primary-foreground hover:shadow-glow shadow-elev-1"
                          : "border border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {switching === id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {current ? "Active Plan" : "Unlock Plan (Free)"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl border border-dashed border-border text-center text-xs text-muted-foreground max-w-xl mx-auto space-y-1.5 bg-muted/10">
          <p className="font-semibold text-foreground">💡 How does the contributor mechanism work?</p>
          <p className="leading-relaxed">
            While access is entirely free during open beta, you are highly encouraged to contribute high-quality notes or textbook links to the <Link to="/lumio-library" className="text-primary hover:underline font-bold">Lumio Public Library</Link> or keep a 5-day study streak alive to help power peer tutoring.
          </p>
        </div>
      </section>
    </div>
  );
}
