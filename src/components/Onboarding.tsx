import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Target,
  UserCheck,
  Check,
} from "lucide-react";
import { SpoudeMark } from "@/components/Logo";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const KEY = "spoude-onboarding-v2";

export function shouldRunOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) !== "done";
  } catch {
    return true;
  }
}

export function resetOnboarding() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Silently ignore storage issues
  }
  window.dispatchEvent(new Event("spoude:onboarding:replay"));
}

export interface OnboardingData {
  level: string;
  subjects: string[];
  goals: string[];
  style: string;
}

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "profiles", user.uid));
        const profile = docSnap.data();
        if (shouldRunOnboarding() && !profile?.onboarding_completed) {
          setOpen(true);
        }
      }
    });
    const replay = () => setOpen(true);
    window.addEventListener("spoude:onboarding:replay", replay);
    return () => {
      unsubscribe();
      window.removeEventListener("spoude:onboarding:replay", replay);
    };
  }, []);

  const finishOnboarding = async (selections: OnboardingData) => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "profiles", user.uid), {
          academic_level: selections.level,
          subjects: selections.subjects,
          goals: selections.goals,
          tutorial_style: selections.style,
          onboarding_completed: true,
        });
        localStorage.setItem(KEY, "done");
        toast.success("Preferences saved! Your AI tutor has adapted to your style.");
        setOpen(false);
        setShowTips(true);
        window.setTimeout(() => setShowTips(false), 12000);
      } catch (err: any) {
        toast.error("Failed to save preferences: " + err.message);
      }
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {open && <WelcomeModal onComplete={finishOnboarding} />}
      {showTips && <TipPulses onDismiss={() => setShowTips(false)} />}
    </>,
    document.body,
  );
}

function WelcomeModal({ onComplete }: { onComplete: (data: OnboardingData) => void }) {
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [style, setStyle] = useState("");

  const SUBJECTS = [
    "Mathematics",
    "Computer Science",
    "Biology",
    "Chemistry",
    "Physics",
    "Law",
    "Medicine",
    "Business",
  ];
  const GOALS = [
    "Organize Messy Notes",
    "Generate Flashcard Decks",
    "Ace Timed Practice Tests",
    "Chat with AI Professor",
  ];

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj],
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal],
    );
  };

  const handleNext = () => {
    if (step === 2 && !level) {
      toast.error("Please select your academic level");
      return;
    }
    if (step === 3 && selectedSubjects.length === 0) {
      toast.error("Select at least one subject of focus");
      return;
    }
    if (step === 4 && selectedGoals.length === 0) {
      toast.error("Select at least one study goal");
      return;
    }
    if (step === 5 && !style) {
      toast.error("Please select a preferred style");
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete({ level, subjects: selectedSubjects, goals: selectedGoals, style });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-md animate-fade-up">
      <div
        className="relative w-full max-w-lg p-8 rounded-[32px] border border-border shadow-elev-3 overflow-hidden"
        style={{ background: "var(--popover)", color: "var(--popover-foreground)" }}
      >
        {/* Geometric Decorative Elements (Phase 8 Requirement) */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-primary" : "bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome Screen */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <SpoudeMark size={24} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                  Introducing
                </p>
                <h2 className="text-xl font-bold tracking-tight">Spoude Study Studio</h2>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Welcome to the quiet, focused study space of 2026. Drag and drop any coursework notes,
              homework sheets, or past exam papers into your library. Spoude instantly builds
              interactive lessons, flashcard decks, and instant-grading mock tests tailored
              specifically for you.
            </p>
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3 text-xs">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <span>Let's answer a few quick questions to personalize your study environment.</span>
            </div>
          </div>
        )}

        {/* Step 2: Academic Level */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> What is your academic level?
            </h3>
            <div className="grid gap-2">
              {[
                "High School",
                "College/Uni Freshman & Sophomore",
                "College/Uni Junior & Senior",
                "Postgraduate / Master's / PhD",
              ].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-semibold transition-all ${
                    level === lvl
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Subjects of Focus */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> What subjects are you focusing on?
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((subj) => {
                const active = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    onClick={() => toggleSubject(subj)}
                    className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-secondary text-muted-foreground"
                    }`}
                  >
                    {subj}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Goals */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> What are your study goals?
            </h3>
            <div className="grid gap-2">
              {GOALS.map((goal) => {
                const active = selectedGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                      active ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
                    }`}
                  >
                    <span>{goal}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Preferred Tutorial Style */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" /> Preferred Learning Style
            </h3>
            <div className="grid gap-2">
              {[
                {
                  id: "socratic",
                  title: "Socratic Professor",
                  desc: "Guides you step-by-step with leading questions.",
                },
                {
                  id: "direct",
                  title: "Direct & Fact-driven",
                  desc: "Gets straight to the core definitions and formulas.",
                },
                {
                  id: "storyteller",
                  title: "Encouraging Storyteller",
                  desc: "Uses analogies, stories, and enthusiastic walkthroughs.",
                },
              ].map((styleObj) => (
                <button
                  key={styleObj.id}
                  onClick={() => setStyle(styleObj.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    style === styleObj.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="font-bold text-sm">{styleObj.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{styleObj.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-8 flex justify-end gap-3 border-t border-border/40 pt-4">
          <button
            onClick={handleNext}
            className="ripple inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold shadow-elev-1 hover:shadow-glow transition-all"
          >
            {step === 5 ? "Finish Setup" : "Continue"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TipPulses({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      <div className="lg:hidden absolute bottom-[3.75rem] left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="tip-bubble">Tap + to open more</div>
        <div className="tip-ring" />
      </div>
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
