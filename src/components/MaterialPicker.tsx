import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, FileText, GraduationCap, Search, Loader2, X, Sparkles, Filter, Link2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TYPE_META = {
  notes: { label: "Class notes", icon: BookOpen, spineTint: "from-amber-400/40 to-amber-600/10" },
  homework: { label: "Homework", icon: FileText, spineTint: "from-emerald-400/40 to-emerald-600/10" },
  exam: { label: "Past exams", icon: GraduationCap, spineTint: "from-violet-400/40 to-violet-600/10" },
} as const;

export type PickerMaterial = {
  id: string;
  title: string;
  subject: string | null;
  type: "notes" | "homework" | "exam";
  file_name: string;
  mime_type: string | null;
  file_size?: number;
};

export function MaterialPicker({
  value,
  onChange,
  emptyHint,
}: {
  value: string | null;
  onChange: (id: string, m: PickerMaterial) => void;
  emptyHint?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "notes" | "homework" | "exam">("all");
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["materials-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("id,title,subject,type,file_name,mime_type,file_size")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PickerMaterial[];
    },
  });

  const selectedMaterial = useMemo(() => {
    return items.find((x) => x.id === value) || null;
  }, [items, value]);

  const filtered = useMemo(() => {
    let list = items;
    if (activeTab !== "all") {
      list = list.filter((m) => m.type === activeTab);
    }
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter(
      (m) =>
        m.title.toLowerCase().includes(t) ||
        (m.subject ?? "").toLowerCase().includes(t) ||
        m.file_name.toLowerCase().includes(t),
    );
  }, [items, q, activeTab]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex-1 flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all duration-200 hover:shadow-elev-2 hover:border-primary/50 bg-card ${
            selectedMaterial
              ? "border-primary bg-primary-soft/30 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)]"
              : "border-border"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
              selectedMaterial ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground"
            }`}>
              {selectedMaterial ? (
                (() => {
                  const Icon = TYPE_META[selectedMaterial.type].icon;
                  return <Icon className="h-5 w-5" />;
                })()
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Selected Document</p>
              <h3 className="text-sm font-semibold text-foreground truncate mt-0.5">
                {selectedMaterial ? selectedMaterial.title : "Choose a book or note..."}
              </h3>
              {selectedMaterial && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {TYPE_META[selectedMaterial.type].label}
                  {selectedMaterial.subject ? ` · ${selectedMaterial.subject}` : ""}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-all">
            {selectedMaterial ? "Change Book" : "Select from Library"}
          </span>
        </button>

        {/* Search Lumio Library button */}
        <Link
          to="/lumio-library"
          className="ripple flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/10 px-4 py-4 text-xs font-semibold text-primary hover:bg-primary-soft/20 hover:border-primary transition-all shadow-elev-1"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span>Search Lumio Library</span>
        </Link>
      </div>

      {/* Floating Modal Backdrop & Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-md animate-fade-in">
          <div
            ref={dialogRef}
            className="relative w-full max-w-2xl bg-popover rounded-3xl border border-border shadow-elev-3 overflow-hidden flex flex-col max-h-[85vh] animate-fade-up"
          >
            {/* Header */}
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-card/60 backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Filter className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight">Your Smart Shelf</h2>
                  <p className="text-[11px] text-muted-foreground">Select a file to start studying page-by-page</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Filter tabs & search */}
            <div className="p-4 border-b border-border/40 space-y-3 bg-muted/20">
              <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/40 transition-all">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search book title, subject, or filename..."
                  className="w-full bg-transparent outline-none text-sm"
                  autoFocus
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {(["all", "notes", "homework", "exam"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow-elev-1"
                        : "bg-card hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "all" ? "📚 All Books" : tab === "notes" ? "📝 Class Notes" : tab === "homework" ? "📖 Homework" : "🎓 Past Exams"}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Spine Grid List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-medium">Fetching books on your shelf...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">No books found matching criteria</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      {q ? "Try broadening your search term or tab filters." : "Your bookshelf is currently empty."}
                    </p>
                  </div>
                  {!q && (
                    <Link
                      to="/library"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full px-4 py-2 hover:shadow-glow transition-all"
                    >
                      Go to Library & Upload
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filtered.map((m) => {
                    const active = value === m.id;
                    const meta = TYPE_META[m.type];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onChange(m.id, m);
                          setIsOpen(false);
                        }}
                        className={`group relative text-left rounded-2xl border transition-all duration-300 p-3.5 flex flex-col justify-between aspect-[3/4.2] overflow-hidden ${
                          active
                            ? "border-primary bg-primary-soft/40 ring-1 ring-primary shadow-elev-2 scale-[1.01]"
                            : "border-border bg-card hover:border-primary/40 hover:shadow-elev-1"
                        }`}
                      >
                        {/* Book Spine design styling */}
                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${meta.spineTint} opacity-20 pointer-events-none`} />
                        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                        <div className="absolute inset-y-1 right-0 w-0.5 bg-white/20 pointer-events-none" />

                        {/* Top corner badge */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80 truncate">
                            {m.subject || "General"}
                          </span>
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                        </div>

                        {/* Bottom details */}
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-3">
                            {m.title}
                          </h4>
                          <p className="text-[9px] text-muted-foreground truncate">
                            {m.file_name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer options */}
            <div className="p-4 bg-muted/40 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">
                Showing {filtered.length} of {items.length} books in library
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to="/lumio-library"
                  onClick={() => setIsOpen(false)}
                  className="text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Browse Public Library</span>
                </Link>
                <span className="text-muted-foreground/40">|</span>
                <Link
                  to="/library"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground font-semibold"
                >
                  Manage uploads
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
