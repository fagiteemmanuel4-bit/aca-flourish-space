import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { Sparkles, Home, Plus, Moon, User, ArrowRight, X, ChevronRight, ChevronLeft, Check, BookOpen, GraduationCap, Trophy, HelpCircle } from "lucide-react";
import { LumioMark } from "@/components/Logo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const KEY = "lumio-onboarding-v1";
const PERSONALIZATION_KEY = "spoude-personalization-v1";

export function shouldRunOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(KEY) !== "done"; } catch { return true; }
}

export function resetOnboarding() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(PERSONALIZATION_KEY);
  } catch {}
  window.dispatchEvent(new Event("lumio:onboarding:replay"));
}

export function loadPersonalization() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PERSONALIZATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (shouldRunOnboarding()) setOpen(true);
    const replay = () => setOpen(true);
    window.addEventListener("lumio:onboarding:replay", replay);
    return () => window.removeEventListener("lumio:onboarding:replay", replay);
  }, []);

  const finish = (personalizationData: any) => {
    try {
      localStorage.setItem(KEY, "done");
      localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(personalizationData));

      // Attempt to save to Supabase User Metadata as well for premium sync
      supabase.auth.updateUser({
        data: {
          personalization: personalizationData
        }
      });
    } catch {}
    setOpen(false);
    setShowTips(true);
    toast.success("🎉 Personalization applied! Your AI tutor has been adjusted to your learning styles.");
    // auto-dismiss tips after 12s so we don't nag
    window.setTimeout(() => setShowTips(false), 12000);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {open && <WelcomeModal onDone={finish} onSkip={() => finish({})} />}
      {showTips && <TipPulses onDismiss={() => setShowTips(false)} />}
    </>,
    document.body,
  );
}

function WelcomeModal({ onDone, onSkip }: { onDone: (data: any) => void; onSkip: () => void }) {
  const [step, setStep] = useState(1);

  // Personalization answers
  const [grade, setGrade] = useState("Undergraduate");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [goal, setStudyGoal] = useState("Conceptual Mastery");
  const [style, setLearningStyle] = useState("eli5");

  const toggleSubject = (sub: string) => {
    setSubjects((p) =>
      p.includes(sub) ? p.filter((x) => x !== sub) : [...p, sub]
    );
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onDone({
        grade,
        subjects,
        goal,
        style
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 animate-fade-up">
      <button
        aria-label="Skip"
        onClick={onSkip}
        className="absolute inset-0 bg-foreground/70 backdrop-blur-md"
      />
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-border shadow-elev-3 flex flex-col justify-between min-h-[480px]"
        style={{ background: "var(--popover)", color: "var(--popover-foreground)" }}
      >
        {/* Absolute Close */}
        <button
          onClick={onSkip}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors z-20"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Step Indicator dots */}
        <div className="flex gap-1.5 mb-6 z-10">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Content switch */}
        <div className="flex-1 flex flex-col justify-center mb-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-lg animate-shimmer" />
                  <div className="relative h-12 w-12 rounded-2xl bg-primary/12 flex items-center justify-center">
                    <LumioMark size={24} />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Academic Workspace</span>
                  <h2 className="text-xl font-black tracking-tight text-foreground">Welcome to Spoude</h2>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Your study, illuminated. Spoude is a calm, quiet, and hyper-personalized space that turns your notes, homework sheets, and textbooks into smart guides, custom practice tests, and interactive audio walks.
              </p>

              <div className="bg-secondary/40 rounded-2xl p-4 flex items-start gap-3 border border-border/50">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">Early Contributor Privileges</h4>
                  <p className="text-xs text-muted-foreground">All premium season passes and subscription costs are completely waived during our active beta program.</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">Onboarding Checklist</span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-0.5">What is your current academic grade level?</h3>
                <p className="text-xs text-muted-foreground">We calibrate practice exam timing and AI explanations to suit your cohort.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  { id: "Highschool", label: "🎒 High School Student" },
                  { id: "Undergraduate", label: "🏛️ Undergraduate (College)" },
                  { id: "Postgraduate", label: "🔬 Postgraduate / Researcher" },
                  { id: "Professional", label: "💼 Professional Learner" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGrade(item.id)}
                    className={`p-3.5 rounded-2xl text-left border text-xs font-bold transition-all ${
                      grade === item.id
                        ? "border-primary bg-primary-soft/30 text-primary shadow-elev-1"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">Onboarding Checklist</span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-0.5">Select subjects you study or teach</h3>
                <p className="text-xs text-muted-foreground">Multi-select to customize recommendations in the Spoude Public Library catalog.</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "💻 Computer Science & DSA",
                  "⚖️ Jurisprudence & Law",
                  "🪐 Mathematics & Physics",
                  "🩺 Medicine & Anatomy",
                  "📈 Economics & Finance",
                  "🏛️ World History & Arts",
                  "🧬 Biological Sciences",
                  "✏️ Engineering & Design"
                ].map((sub) => {
                  const isSelected = subjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-glow"
                          : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {sub} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">Onboarding Checklist</span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-0.5">What is your primary study goal?</h3>
                <p className="text-xs text-muted-foreground">Adjust roadmap checklists and timeline paths to support your schedule.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  { id: "Exam Prep", label: "🏆 Ace timed mock exams" },
                  { id: "Conceptual Mastery", label: "🧩 Deep conceptual understanding" },
                  { id: "Quick Cramming", label: "⚡ Fast reference cheat sheets" },
                  { id: "Audio Walkthroughs", label: "🎧 Hands-free audio narrations" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStudyGoal(item.id)}
                    className={`p-3.5 rounded-2xl text-left border text-xs font-bold transition-all ${
                      goal === item.id
                        ? "border-primary bg-primary-soft/30 text-primary shadow-elev-1"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">Onboarding Checklist</span>
                <h3 className="text-lg font-bold tracking-tight text-foreground mt-0.5">Choose your primary AI Tutor style</h3>
                <p className="text-xs text-muted-foreground">Pick a tutoring format. You can switch this at any point on the fly in Study Workspace.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  { id: "eli5", emoji: "🧒", label: "Explain Like I'm 5", desc: "Short sentences, simple analogies" },
                  { id: "socratic", emoji: "🤔", label: "Socratic Coach", desc: "Question guided checkpoints" },
                  { id: "real", emoji: "🌍", label: "Real-World Examples", desc: "Anchored to daily scenarios" },
                  { id: "cram", emoji: "⚡", label: "Exam Cram Mode", desc: "Highest-yield facts, no fluff" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLearningStyle(item.id)}
                    className={`p-3 rounded-2xl text-left border flex flex-col justify-between transition-all ${
                      style === item.id
                        ? "border-primary bg-primary-soft/30 shadow-elev-1"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.emoji}</span>
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4 mt-auto">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onSkip}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
            >
              Skip Intro
            </button>
          )}

          <button
            onClick={handleNext}
            className="ripple inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold shadow-elev-1 hover:shadow-glow transition-all"
          >
            <span>{step === 5 ? "Illuminate my study!" : "Continue"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon, tone, title, desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "gold" | "violet" | "emerald";
  title: string; desc: string;
}) {
  const toneCls: Record<string, string> = {
    primary: "bg-primary/12 text-primary",
    gold: "bg-amber-400/15 text-amber-500 dark:text-amber-300",
    violet: "bg-violet-500/15 text-violet-500 dark:text-violet-300",
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  };
  return (
    <li className="flex items-start gap-3">
      <div className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 ${toneCls[tone]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold">{title}</div>
        <div className="text-[12px] text-muted-foreground leading-relaxed">{desc}</div>
      </div>
    </li>
  );
}

/**
 * Subtle glow rings anchored to the mobile bottom-nav plus button and the
 * top-bar theme toggle. Non-blocking; auto-dismisses.
 */
function TipPulses({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      {/* Mobile plus button — bottom center */}
      <div className="lg:hidden absolute bottom-[3.75rem] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="tip-bubble">Tap + to open more</div>
        <div className="tip-ring" />
      </div>
      {/* Desktop theme toggle — top right area */}
      <div className="hidden lg:block absolute top-9 right-[8.75rem]">
        <div className="flex flex-col items-center gap-1">
          <div className="tip-bubble">Switch light / dark</div>
          <div className="tip-ring" />
        </div>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss tips"
        className="pointer-events-auto absolute top-2 right-2 text-[10px] text-muted-foreground bg-background/70 backdrop-blur px-2 py-1 rounded-full border border-border"
      >
        got it
      </button>
    </div>
  );
}
