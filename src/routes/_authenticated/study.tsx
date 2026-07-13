import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaterialPicker, type PickerMaterial } from "@/components/MaterialPicker";
import { TEACHING_STYLES, styleById, type TeachingStyle } from "@/lib/teaching-styles";
import { Markdown } from "@/components/Markdown";
import { SpeakButton } from "@/components/SpeakButton";
import { getUsage } from "@/lib/exam.functions";
import { planFor } from "@/lib/plans";
import {
  BookOpenCheck,
  Sparkles,
  Loader2,
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
  Map,
  X,
  Minimize2,
  Maximize2,
  FileDown,
  CheckCircle2,
  Award,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/study")({
  head: () => ({ meta: [{ title: "Study Workspace — Lumio" }] }),
  component: StudyPage,
});

type Stage = "pick" | "lesson";

// Categories for Teaching Styles
const STYLE_CATEGORIES = [
  { id: "foundational", label: "🌱 Core & Foundational", ids: ["eli5", "socratic", "analogy", "feynman", "ladder"] },
  { id: "fast", label: "⚡ Fast Track & reference", ids: ["cram", "cheatsheet", "speed", "recap", "outline"] },
  { id: "interactive", label: "🎯 Drills & Discussions", ids: ["real", "debate", "drill", "interleaved", "case"] },
  { id: "memory", label: "🧠 Memory & Steps", ids: ["story", "step", "mnemonic", "compare"] },
];

export function StudyPage() {
  const [stage, setStage] = useState<Stage>("pick");
  const [material, setMaterial] = useState<PickerMaterial | null>(null);
  const [styleId, setStyleId] = useState<string>(TEACHING_STYLES[0].id);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Teaching Style Dropdown states
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [styleSearch, setStyleSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // AI Roadmap States
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [roadmapMinimized, setRoadmapMinimized] = useState(true);
  const [roadmapNodes, setRoadmapNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const { data: usage } = useQuery({ queryKey: ["ai-usage"], queryFn: () => getUsage() });

  useEffect(() => () => abortRef.current?.abort(), []);

  // Click outside Teaching style dropdown
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStyleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const streamPage = async (pageNum: number, previousSummary: string) => {
    if (!material) return;
    setError(null);
    setStreaming(true);
    setPages((p) => {
      const next = [...p];
      next[pageNum - 1] = "";
      return next;
    });
    setCurrentPage(pageNum - 1);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Not signed in");
      const res = await fetch("/api/teach", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ materialId: material.id, styleId, page: pageNum, previousSummary }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setPages((p) => {
          const next = [...p];
          next[pageNum - 1] = (next[pageNum - 1] ?? "") + chunk;
          return next;
        });
      }
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Lesson failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setStreaming(false);
    }
  };

  const start = async () => {
    if (!material) return toast.error("Pick a document first");
    setStage("lesson");
    setPages([]);
    setCurrentPage(0);
    // Generate static roadmap elements for visual graph automatically based on the document
    generateMockRoadmap(material.title, material.subject || "General Science");
    await streamPage(1, "");
  };

  const generateMockRoadmap = (title: string, subject: string) => {
    setGeneratingRoadmap(true);
    const mockNodes = [
      {
        id: "1",
        label: "Introduction & Key terminology",
        desc: "Core definitions, fundamentals of " + subject + ", and overall context outline.",
        estTime: "15 mins",
        status: "completed",
        tasks: ["Read Lesson Overview", "Learn 5 Key Definitions", "Attempt socratic checkpoints"],
      },
      {
        id: "2",
        label: "Intermediate structural deep dive",
        desc: "Structural and qualitative logic explained in " + title + ". Breaking down variables and workflows.",
        estTime: "25 mins",
        status: "active",
        tasks: ["Listen to voice narration", "Examine core diagrams", "Draft quick lesson recap card"],
      },
      {
        id: "3",
        label: "Real-world scenario drill & application",
        desc: "Putting theoretical lessons to work in active study environments, practical formulas and solutions.",
        estTime: "20 mins",
        status: "locked",
        tasks: ["Complete case study workbook", "Analyze 2 practical problems", "Review with your AI Coach"],
      },
      {
        id: "4",
        label: "Simulated exam drill & evaluation",
        desc: "Dynamic review and testing of knowledge under speed run pressure.",
        estTime: "30 mins",
        status: "locked",
        tasks: ["Take 10 practice questions", "Review incorrect responses", "Gain achievement badges"],
      }
    ];
    setRoadmapNodes(mockNodes);
    setSelectedNode(mockNodes[0]);
    setTimeout(() => {
      setGeneratingRoadmap(false);
    }, 1200);
  };

  const downloadRoadmapAsTxt = () => {
    if (!material) return;
    const header = `=========================================\n`;
    const title = `LUMIO AI STUDY ROADMAP: ${material.title.toUpperCase()}\n`;
    const sub = `Subject: ${material.subject || "General Study"}\n`;
    const footer = `=========================================\n\n`;
    let content = header + title + sub + footer;

    roadmapNodes.forEach((node, idx) => {
      content += `Step ${idx + 1}: ${node.label} (${node.estTime})\n`;
      content += `Description: ${node.desc}\n`;
      content += `Tasks:\n`;
      node.tasks.forEach((t: string) => {
        content += `  [ ] ${t}\n`;
      });
      content += `\n-----------------------------------------\n\n`;
    });

    content += `Generated using Lumio AI — Your study, illuminated.\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumio_roadmap_${material.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Roadmap plan exported as .txt successfully!");
  };

  const continueDeeper = async () => {
    const summary = pages
      .map((p, i) => `Page ${i + 1}:\n${p.slice(0, 1200)}`)
      .join("\n\n---\n\n")
      .slice(0, 4000);
    await streamPage(pages.length + 1, summary);
  };

  const restart = () => {
    abortRef.current?.abort();
    setStage("pick");
    setPages([]);
    setCurrentPage(0);
    setError(null);
  };

  // Dropdown style filtering
  const filteredStyles = useMemo(() => {
    const q = styleSearch.trim().toLowerCase();
    if (!q) return TEACHING_STYLES;
    return TEACHING_STYLES.filter(
      (s) => s.label.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q)
    );
  }, [styleSearch]);

  const currentSelectedStyle = useMemo(() => {
    return styleById(styleId);
  }, [styleId]);

  const plan = planFor(usage?.plan);

  if (stage === "lesson" && material) {
    const style = styleById(styleId);
    const pageText = pages[currentPage] ?? "";
    const isLastPage = currentPage === pages.length - 1;
    const lessonComplete = /lesson complete/i.test(pageText);

    return (
      <div className="space-y-6 animate-fade-up max-w-3xl mx-auto relative pb-20">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={restart}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <SpeakButton text={pageText} disabled={!pageText} />
            <button
              onClick={start}
              disabled={streaming}
              className="ripple inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New lesson
            </button>
          </div>
        </div>

        <header className="surface p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
              <span className="text-base">{style.emoji}</span>
              <span className="font-semibold text-foreground">{style.label}</span>
              <span>·</span>
              <span className="truncate">{material.title}</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-md">
              Page {currentPage + 1} / {pages.length}
            </span>
          </div>
          {pages.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-1.5 relative z-10">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`h-7 w-7 rounded-md text-xs font-semibold transition-all ${
                    i === currentPage
                      ? "bg-primary text-primary-foreground shadow-elev-1 scale-105"
                      : "bg-primary-soft text-foreground hover:bg-primary/20"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </header>

        {error ? (
          <div className="surface p-6 text-sm text-destructive">{error}</div>
        ) : (
          <article className="surface p-6 sm:p-8 min-h-[300px]">
            {pageText ? (
              <Markdown>{pageText}</Markdown>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Reading your document and preparing the lesson…
              </div>
            )}
            {streaming && pageText && isLastPage && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" /> writing…
              </div>
            )}
          </article>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="ripple inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-primary/40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>

          {/* AI Roadmap button on the fly */}
          <button
            onClick={() => {
              setRoadmapOpen(true);
              setRoadmapMinimized(false);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-soft/10 text-primary px-4 py-2 text-xs font-bold hover:bg-primary-soft/20 transition-all shadow-elev-1"
          >
            <Map className="h-4 w-4 text-primary animate-bounce" />
            View Lesson Roadmap
          </button>

          {isLastPage && !streaming && !lessonComplete ? (
            <button
              onClick={continueDeeper}
              className="ripple inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold shadow-elev-1 hover:shadow-glow transition-all"
            >
              Continue — go deeper <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
              disabled={isLastPage}
              className="ripple inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium disabled:opacity-40 hover:border-primary/40 transition-colors"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ========================================= */}
        {/* INTERACTIVE AI STUDY ROADMAP COMPONENT */}
        {/* ========================================= */}
        {roadmapOpen && !roadmapMinimized && (
          <div className="fixed inset-0 z-[104] bg-background/95 backdrop-blur-sm animate-fade-in" />
        )}
        {roadmapOpen && (
          <div
            className={`fixed z-[105] transition-all duration-300 ${
              roadmapMinimized
                ? "bottom-4 right-4 w-80 h-16 border border-primary/30 rounded-2xl bg-card shadow-elev-3 overflow-hidden p-3 flex items-center justify-between"
                : "inset-4 sm:inset-10 md:inset-16 bg-popover rounded-3xl border border-border shadow-elev-3 overflow-hidden flex flex-col"
            }`}
          >
            {roadmapMinimized ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Map className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">AI Roadmap minimized</h4>
                    <p className="text-[10px] text-muted-foreground truncate">Step {roadmapNodes.findIndex(n => n.status === "active") + 1} currently active</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRoadmapMinimized(false)}
                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Maximize"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setRoadmapOpen(false)}
                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Header */}
                <div className="p-5 border-b border-border/60 bg-card/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center shadow-glow">
                      <Map className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base tracking-tight text-foreground flex items-center gap-2">
                        AI Roadmap Graph
                        <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary animate-pulse">
                          Live Analysis
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">Detailed node pathways to achieve subject mastery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadRoadmapAsTxt}
                      className="inline-flex items-center gap-1 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground px-3.5 py-1.5 text-xs font-semibold transition-all"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>Export Plan (.txt)</span>
                    </button>
                    <button
                      onClick={() => setRoadmapMinimized(true)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Minimize"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setRoadmapOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Graph Visualization area */}
                <div className="flex-1 overflow-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-muted/10">
                  {/* Left: SVG node chart drawing */}
                  <div className="lg:col-span-8 p-6 flex flex-col items-center justify-center relative min-h-[350px]">
                    {generatingRoadmap ? (
                      <div className="flex flex-col items-center gap-2.5">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                        <span className="text-xs font-semibold text-muted-foreground">Drafting learning paths...</span>
                      </div>
                    ) : (
                      <div className="w-full max-w-xl flex flex-col items-stretch relative gap-10">
                        {/* Connecting Line */}
                        <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-blue-400 to-border/50 -z-10" />

                        {roadmapNodes.map((node, index) => {
                          const isActive = node.id === selectedNode?.id;
                          const isCompleted = node.status === "completed";
                          const isNodeActive = node.status === "active";
                          const isLocked = node.status === "locked";

                          return (
                            <button
                              key={node.id}
                              onClick={() => setSelectedNode(node)}
                              className={`flex items-start gap-4 text-left p-3 rounded-2xl transition-all duration-200 z-10 ${
                                isActive
                                  ? "bg-primary-soft/40 border border-primary/50 shadow-elev-1"
                                  : "hover:bg-muted/50 border border-transparent"
                              }`}
                            >
                              {/* Left Marker indicator */}
                              <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-xs transition-all ${
                                isCompleted
                                  ? "bg-emerald-500 border-emerald-600 text-white"
                                  : isNodeActive
                                    ? "bg-primary text-primary-foreground border-primary animate-pulse"
                                    : "bg-card border-border text-muted-foreground"
                              }`}>
                                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                              </div>

                              {/* Text details */}
                              <div className="min-w-0 flex-1 pt-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={`text-sm font-bold ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
                                    {node.label}
                                  </h4>
                                  <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full ${
                                    isCompleted
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : isNodeActive
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                  }`}>
                                    {node.status}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{node.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Panel: Selected node info card */}
                  <div className="lg:col-span-4 border-l border-border/60 bg-card p-6 overflow-y-auto flex flex-col justify-between">
                    {selectedNode ? (
                      <div className="space-y-5 animate-fade-in">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest font-bold text-primary">Pathway Node Details</div>
                          <h4 className="text-base font-bold text-foreground mt-1">{selectedNode.label}</h4>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{selectedNode.desc}</p>
                        </div>

                        <div className="rounded-xl bg-muted/30 p-3.5 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated study duration:</span>
                            <span className="font-semibold text-foreground">{selectedNode.estTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-semibold uppercase text-primary text-[10px]">{selectedNode.status}</span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Study tasks checklist</h5>
                          <ul className="space-y-2">
                            {selectedNode.tasks.map((task: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-xs">
                                <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${selectedNode.status === "completed" ? "text-emerald-500" : "text-muted-foreground/60"}`} />
                                <span className={selectedNode.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}>
                                  {task}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 text-muted-foreground">
                        <Map className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-xs">Select any pathway node to view details</p>
                      </div>
                    )}

                    <div className="border-t border-border/60 pt-4 mt-6">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground leading-snug">
                        <Award className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Completing tasks boosts honor streaks & badges</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Preload teaching style detail based on state search
  const categoriesList = STYLE_CATEGORIES.map((cat) => {
    const matched = cat.ids
      .map((id) => filteredStyles.find((x) => x.id === id))
      .filter(Boolean) as TeachingStyle[];
    return { ...cat, styles: matched };
  }).filter((c) => c.styles.length > 0);

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl relative">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-widest">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Smart study workspace</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 mt-1">
            <BookOpenCheck className="h-8 w-8 text-indigo-500" /> Study
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Choose a book or past exam, pick your preferred teaching system, and learn dynamically with tailored checklists and roadmap graphs.
          </p>
        </div>
        {usage && (
          <div className="text-xs text-muted-foreground bg-card border border-border/60 rounded-xl px-3 py-2 shrink-0">
            <span className="text-foreground font-semibold">{usage.used}</span> / {usage.limit} lessons this month · {plan.name}
            <Link to="/billing" className="ml-2 text-primary hover:underline font-bold">Manage</Link>
          </div>
        )}
      </header>

      {/* Select document */}
      <section className="surface p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">1. Select document</h2>
          <Link to="/library" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Manage Library</span>
          </Link>
        </div>
        <MaterialPicker
          value={material?.id ?? null}
          onChange={(_id, m) => setMaterial(m)}
          emptyHint={<span>Your library is empty. <Link to="/library" className="text-primary hover:underline font-bold">Upload one</Link> to begin.</span>}
        />
      </section>

      {/* Choose Teaching Style (Custom Dropdown) */}
      <section className="surface p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2. Select teaching style</h2>

        {/* Custom Styled Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/50 transition-all shadow-elev-1"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-2xl leading-none">{currentSelectedStyle.emoji}</span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{currentSelectedStyle.label}</h4>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{currentSelectedStyle.blurb}</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${styleDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Expanded dropdown content */}
          {styleDropdownOpen && (
            <div className="absolute top-[102%] left-0 right-0 z-50 rounded-2xl border border-border bg-popover shadow-elev-3 overflow-hidden flex flex-col max-h-[420px] animate-fade-up">
              {/* Dropdown Search */}
              <div className="p-3 border-b border-border/60 bg-muted/30 flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={styleSearch}
                  onChange={(e) => setStyleSearch(e.target.value)}
                  placeholder="Search teaching styles (e.g. ELI5, stories, drills...)"
                  className="w-full bg-transparent outline-none text-xs"
                  autoFocus
                />
              </div>

              {/* Categorized List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {categoriesList.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No matching teaching styles found.</p>
                ) : (
                  categoriesList.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-muted/20 rounded-md">
                        {cat.label}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        {cat.styles.map((s) => {
                          const isSelected = s.id === styleId;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setStyleId(s.id);
                                setStyleDropdownOpen(false);
                                setStyleSearch("");
                              }}
                              className={`text-left rounded-xl p-2.5 flex items-start gap-2.5 transition-all ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-glow"
                                  : "hover:bg-sidebar-accent"
                              }`}
                            >
                              <span className="text-lg leading-none pt-0.5">{s.emoji}</span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold truncate">{s.label}</span>
                                  {isSelected && <Check className="h-3 w-3 shrink-0" />}
                                </div>
                                <p className={`text-[10px] line-clamp-1 mt-0.5 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                  {s.blurb}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Start workspace */}
      <div className="flex items-center justify-end">
        <button
          onClick={start}
          disabled={!material}
          className="ripple inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-sm font-bold shadow-elev-2 hover:shadow-glow transition-all disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" /> Start learning session
        </button>
      </div>
    </div>
  );
}
