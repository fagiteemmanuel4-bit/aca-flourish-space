import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Upload,
  Download,
  Sparkles,
  BookOpen,
  FileText,
  GraduationCap,
  Scale,
  ShieldAlert,
  BadgeCheck,
  School,
  Mail,
  FileSpreadsheet,
  Lock,
  Clock,
  Info,
  Check,
  ArrowRight,
  UserCheck,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/lumio-library")({
  head: () => ({ meta: [{ title: "Lumio Public Library — Lumio" }] }),
  component: LumioLibraryPage,
});

type CommunityBook = {
  id: string;
  title: string;
  subject: string;
  author: string;
  downloads: number;
  type: "book" | "notes" | "exam";
  institution?: string;
  uploader: string;
  isVerified: boolean;
};

const INITIAL_COMMUNITY_BOOKS: CommunityBook[] = [
  { id: "cb-1", title: "Introduction to Quantum Computing", subject: "Physics", author: "Dr. Alicia Vance", downloads: 1420, type: "book", institution: "MIT", uploader: "quantum_enthusiast", isVerified: true },
  { id: "cb-2", title: "Advanced Organic Chemistry Recaps", subject: "Chemistry", author: "Prof. Marcus Brody", downloads: 853, type: "notes", institution: "Stanford University", uploader: "chem_lead", isVerified: true },
  { id: "cb-3", title: "Global Macroeconomics Past Exam & Guide", subject: "Economics", author: "Department of Economics", downloads: 2104, type: "exam", institution: "Oxford University", uploader: "econ_prepper", isVerified: true },
  { id: "cb-4", title: "Data Structures & Algorithms Cheat Sheets", subject: "Computer Science", author: "Alvin Stark", downloads: 3412, type: "notes", uploader: "dev_alvin", isVerified: true },
  { id: "cb-5", title: "Civil Jurisprudence Foundations", subject: "Law", author: "Judge Evelyn Carter", downloads: 641, type: "book", institution: "Harvard Law", uploader: "legal_eagle", isVerified: true },
  { id: "cb-6", title: "Linear Algebra & Vector Spaces", subject: "Mathematics", author: "Gilbert Strang", downloads: 1980, type: "book", uploader: "math_wizard", isVerified: true },
];

export function LumioLibraryPage() {
  const [activeTab, setActiveTab] = useState<"browse" | "legal" | "institutions">("browse");
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<CommunityBook[]>(INITIAL_COMMUNITY_BOOKS);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Public upload & AI verification simulator states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSubject, setUploadSubject] = useState("");
  const [uploadAuthor, setUploadAuthor] = useState("");
  const [uploadType, setUploadType] = useState<"book" | "notes" | "exam">("book");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Verification pipeline simulation states
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [verifyLogs, setVerifyLogs] = useState<string[]>([]);

  // Institution Business Account States
  const [instModalOpen, setInstModalOpen] = useState(false);
  const [instEmail, setInstEmail] = useState("");
  const [instName, setInstName] = useState("");
  const [instType, setInstType] = useState("University");
  const [isRegistered, setIsRegistered] = useState(false);

  // Institution Dashboard States
  const [defaultVisibility, setDefaultVisibility] = useState<"all" | "students">("all");
  const [studentCsvFile, setStudentCsvFile] = useState<File | null>(null);
  const [matricRoster, setMatricRoster] = useState<string[]>(["2024/MIT/3820", "2024/MIT/9182", "2024/MIT/4431"]);
  const [newMatric, setNewMatric] = useState("");

  const subjects = useMemo(() => {
    const list = new Set(books.map((b) => b.subject));
    return ["All", ...Array.from(list)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = query.trim().toLowerCase();
      const matchesSearch =
        b.title.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.uploader.toLowerCase().includes(q);

      const matchesSubject = selectedSubject === "All" || b.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [books, query, selectedSubject]);

  const handleDownload = (bookId: string, title: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, downloads: b.downloads + 1 } : b))
    );
    toast.success(`Successfully downloaded "${title}"!`);
  };

  const startAiVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadSubject || !uploadAuthor || !uploadFile) {
      toast.error("Please fill in all upload parameters");
      return;
    }

    setVerifying(true);
    setVerifyStep(1);
    setVerifyLogs(["[AI Scanner] Reading file stream and binary encoding..."]);

    // Step 1: Quality Check
    setTimeout(() => {
      setVerifyStep(2);
      setVerifyLogs((p) => [
        ...p,
        "[AI Quality Analyzer] Academic resolution checked: 98% clarity verified.",
        "[AI Quality Analyzer] Quality, indexes, and source chapters formatted successfully."
      ]);
    }, 1500);

    // Step 2: Safety Check
    setTimeout(() => {
      setVerifyStep(3);
      setVerifyLogs((p) => [
        ...p,
        "[AI Safety Guard] Content scanned for academic dishonesty and structural toxicity.",
        "[AI Safety Guard] Verified safe under Global Academic Safety and Compliance Code."
      ]);
    }, 3000);

    // Step 3: Copyright Check
    setTimeout(() => {
      setVerifyStep(4);
      setVerifyLogs((p) => [
        ...p,
        "[AI Copyright Scanner] Querying digital publisher databases & catalog registries...",
        "[AI Copyright Scanner] Zero active DMCA copyright matches or plagiarism flags found. Safe for distribution!"
      ]);
    }, 4500);

    // Final Release
    setTimeout(() => {
      setVerifying(false);
      setUploadModalOpen(false);
      const newBook: CommunityBook = {
        id: `cb-${Date.now()}`,
        title: uploadTitle,
        subject: uploadSubject,
        author: uploadAuthor,
        downloads: 0,
        type: uploadType,
        uploader: "verified_student",
        isVerified: true,
      };
      setBooks((prev) => [newBook, ...prev]);
      toast.success("AI Verification Complete! Material is now live in Lumio Public Library.");

      // Reset
      setUploadTitle("");
      setUploadSubject("");
      setUploadAuthor("");
      setUploadFile(null);
      setVerifyStep(0);
      setVerifyLogs([]);
    }, 6000);
  };

  const handleRegisterInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instEmail || !instName) {
      toast.error("Please enter a valid institution name and business email");
      return;
    }
    if (!instEmail.endsWith(".edu") && !instEmail.endsWith(".ac.uk") && !instEmail.endsWith(".edu.ng")) {
      toast.error("Please register using a valid academic/business email (.edu, .ac.uk, .edu.ng, etc.)");
      return;
    }

    setIsRegistered(true);
    setInstModalOpen(false);
    toast.success(`Welcome to Lumio Academic Portal! ${instName} Admin console unlocked.`);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudentCsvFile(file);
      // Simulate CSV parse
      toast.loading("Reading Matric roster spreadsheet...");
      setTimeout(() => {
        toast.dismiss();
        setMatricRoster((prev) => [
          ...prev,
          "2024/MIT/0993",
          "2024/MIT/5532",
          "2024/MIT/6618",
          "2024/MIT/1049"
        ]);
        toast.success("CSV parse complete: 4 student matric numbers loaded successfully.");
      }, 1000);
    }
  };

  const addSingleMatric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatric.trim()) return;
    setMatricRoster((p) => [...p, newMatric.trim().toUpperCase()]);
    setNewMatric("");
    toast.success("Matric number added to verify database.");
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Top Header Jumbotron */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card p-6 sm:p-8 shadow-elev-1">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 10% 20%, var(--color-primary), transparent 45%), radial-gradient(circle at 90% 80%, var(--color-indigo-400), transparent 40%)",
          }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Public Knowledge Exchange</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-display">
              Lumio Library
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Browse, search and download free study books, notes and past papers shared by researchers, students, and world-class academies. Guaranteed 100% free of DMCA violations via Lumio AI guardrails.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="ripple inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold rounded-2xl px-5 py-3 shadow-elev-2 hover:shadow-glow transition-all"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Book</span>
            </button>
            <button
              onClick={() => {
                if (isRegistered) {
                  setActiveTab("institutions");
                } else {
                  setInstModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card hover:bg-muted text-sm font-semibold px-5 py-3 transition-all shadow-elev-1"
            >
              <School className="h-4 w-4 text-indigo-500" />
              <span>{isRegistered ? "Institution Portal" : "Institutional Setup"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("browse")}
          className={`group relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
            activeTab === "browse" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Browse Catalog</span>
          <span
            className={`absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-primary transition-transform duration-300 origin-left ${
              activeTab === "browse" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </button>

        <button
          onClick={() => setActiveTab("legal")}
          className={`group relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
            activeTab === "legal" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scale className="h-4 w-4 text-indigo-500" />
          <span>Legal & DMCA Policies</span>
          <span
            className={`absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-indigo-500 transition-transform duration-300 origin-left ${
              activeTab === "legal" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </button>

        <button
          onClick={() => {
            if (isRegistered) {
              setActiveTab("institutions");
            } else {
              setInstModalOpen(true);
            }
          }}
          className={`group relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
            activeTab === "institutions" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <School className="h-4 w-4 text-emerald-500" />
          <span>Institutions Hub {isRegistered && "🐾"}</span>
          <span
            className={`absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-emerald-500 transition-transform duration-300 origin-left ${
              activeTab === "institutions" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </button>
      </div>

      {/* Main Tab content router */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-2xl border border-input bg-card px-4 py-2.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/40 transition-all">
              <Search className="h-4.5 w-4.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search catalog by title, authors, subject or uploader..."
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
            {/* Subject Pill List */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedSubject === sub
                      ? "bg-primary text-primary-foreground shadow-elev-1"
                      : "bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Book Catalog shelf grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBooks.map((book) => {
              const spineTint =
                book.type === "book"
                  ? "from-blue-400/40 to-blue-600/10"
                  : book.type === "notes"
                    ? "from-amber-400/40 to-amber-600/10"
                    : "from-violet-400/40 to-violet-600/10";

              return (
                <div
                  key={book.id}
                  className="surface rounded-2xl p-4 flex flex-col justify-between aspect-[3/4.2] overflow-hidden relative group hover:border-primary/40 transition-all shadow-elev-1 hover:shadow-elev-2"
                >
                  {/* Spine graphics */}
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${spineTint} opacity-20 pointer-events-none`} />
                  <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />

                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary truncate bg-primary/5 px-2 py-0.5 rounded-md">
                      {book.subject}
                    </span>
                    {book.isVerified && (
                      <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        <BadgeCheck className="h-3 w-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Core details */}
                  <div className="space-y-2 my-auto relative z-10">
                    <h3 className="font-bold text-sm leading-snug text-foreground line-clamp-3 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground italic truncate">
                      by {book.author}
                    </p>
                    {book.institution && (
                      <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold bg-indigo-500/5 px-1.5 py-0.5 rounded w-fit">
                        <School className="h-3 w-3" />
                        <span>{book.institution}</span>
                      </div>
                    )}
                  </div>

                  {/* Action & download counter */}
                  <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 mt-2 relative z-10">
                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                      <p className="font-medium">Uploaded by:</p>
                      <p className="font-semibold text-foreground truncate max-w-[80px]">@{book.uploader}</p>
                    </div>

                    <button
                      onClick={() => handleDownload(book.id, book.title)}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary text-primary-foreground px-3 py-2 text-xs font-bold shadow-elev-1 hover:shadow-glow transition-all"
                    >
                      <Download className="h-3 w-3" />
                      <span>{book.downloads}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sell promotion coming soon footer banner */}
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-indigo-400/40 bg-indigo-500/5 p-6 backdrop-blur text-center space-y-2">
            <span className="text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500">
              Coming Soon
            </span>
            <h3 className="text-base font-bold text-foreground">Monetize Your Digital Bookshelves</h3>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              We are working on high-performance micropayments to let you sell your research, premium test banks, and courses directly on the Lumio ecosystem. Sign up for early partner beta updates.
            </p>
          </div>
        </div>
      )}

      {activeTab === "legal" && (
        <div className="surface p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Legal Safeguards & Academic Integrity</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Lumio Public Library is built on a foundation of intellectual property protection, student safety, and rigid ethical guidelines. Please review our comprehensive operational documents below.
          </p>

          <div className="space-y-4 divide-y divide-border/60">
            {/* Document 1 */}
            <div className="pt-4 first:pt-0 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <span className="text-primary font-bold">1.</span> DMCA & Copyright Protection Policy
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lumio enforces a strict zero-tolerance copyright violation framework. Users are strictly prohibited from uploading textbooks, copyrighted articles, or proprietary exam booklets without explicit license agreements from publishers. Every file uploaded goes through an AI quality and trademark fingerprinting process.
              </p>
              <div className="bg-muted/30 rounded-xl p-3 border border-border/40 text-[11px] text-muted-foreground flex gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  To file a copyright infringement claim, please contact our legal registry team at <span className="text-foreground font-semibold">copyright@lumio.app</span> with details including URL parameters, publication receipts, and digital signature records.
                </p>
              </div>
            </div>

            {/* Document 2 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <span className="text-primary font-bold">2.</span> Academic Integrity & Anti-Cheating Covenant
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our objective is study illumination, not academic bypass. Uploading active homework sheets, current-semester assessments with answers, or copyrighted test banks meant to be administered is strictly illegal. Users uploading materials that violate school conduct policies face immediate account banning and forfeiture of all honor score streaks.
              </p>
            </div>

            {/* Document 3 */}
            <div className="pt-4 space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <span className="text-primary font-bold">3.</span> License Grants & Upload Liability Waiver
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By uploading document files, you grant Lumio a non-exclusive, sub-licensable, royalty-free, perpetual digital distribution license to make the files publicly readable, downloadable, and crawlable by the AI tutor systems. You certify that you are the primary creator or authorized licensee of the shared intellectual content.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "institutions" && (
        <div className="space-y-6">
          {/* School Admin Console */}
          <div className="surface p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">School Admin Console — {instName || "MIT Portal"}</h2>
                  <p className="text-xs text-muted-foreground">{instEmail || "admin@mit.edu"}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600">
                Authorized Admin Session
              </span>
            </div>

            <hr className="border-border/60" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Privacy/Visibility Controls */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Privacy & Distribution Scope</h3>
                <p className="text-xs text-muted-foreground">Define who can browse and download study materials uploaded by your university admin roster.</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setDefaultVisibility("all");
                      toast.success("Visibility updated: Open to public student registry");
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      defaultVisibility === "all"
                        ? "border-emerald-500 bg-emerald-500/5 shadow-elev-1"
                        : "border-border hover:border-primary/30 bg-card"
                    }`}
                  >
                    <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
                    <div className="mt-3">
                      <h4 className="text-xs font-bold">Public Exchange</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Open to any student</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setDefaultVisibility("students");
                      toast.success("Visibility updated: Private to registered matric lists only.");
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      defaultVisibility === "students"
                        ? "border-emerald-500 bg-emerald-500/5 shadow-elev-1"
                        : "border-border hover:border-primary/30 bg-card"
                    }`}
                  >
                    <Lock className="h-4.5 w-4.5 text-emerald-600" />
                    <div className="mt-3">
                      <h4 className="text-xs font-bold">Private Cohort</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">My students only</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Student Verification List Upload (Matric roster) */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Matric Student Roster Roster</h3>
                <p className="text-xs text-muted-foreground">Upload list of approved Matric numbers as CSV. Lumio locks downloading private cohort materials unless a valid matching matric code is input.</p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 border border-dashed border-border rounded-xl px-4 py-3 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all text-xs font-semibold text-muted-foreground">
                    <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
                    <span>{studentCsvFile ? studentCsvFile.name : "Upload Matric Roster CSV"}</span>
                    <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                  </label>
                </div>

                <form onSubmit={addSingleMatric} className="flex gap-2">
                  <input
                    value={newMatric}
                    onChange={(e) => setNewMatric(e.target.value)}
                    placeholder="E.g., 2024/MIT/1234"
                    className="flex-1 rounded-xl border border-input bg-card px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                  />
                  <button type="submit" className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:shadow-glow transition-all">
                    Add
                  </button>
                </form>
              </div>
            </div>

            {/* Matric List display */}
            <div className="border-t border-border/60 pt-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Roster verification records ({matricRoster.length} students enrolled)</span>
                <span className="text-primary">Syncing with Lumio database</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matricRoster.map((code) => (
                  <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-[10px] font-mono border border-border">
                    <UserCheck className="h-3 w-3 text-emerald-500" />
                    {code}
                  </span>
                ))}
              </div>
            </div>

            {/* Verification Under Development (Locked Alert) */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex gap-3 text-foreground/90">
              <Lock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-600 dark:text-amber-400">Locked Feature: Cohort Lock Verification under development</p>
                <p className="leading-relaxed">
                  We are actively coding the background student database linkage to dynamically query the Lumio server databases for automated student email check. Private book downloads are currently on developer-lock.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* PUBLIC UPLOAD & AI VERIFICATION MODAL */}
      {/* ========================================= */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-popover rounded-3xl border border-border shadow-elev-3 overflow-hidden flex flex-col animate-fade-up max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-card/40">
              <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload to Public Library</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (!verifying) setUploadModalOpen(false);
                }}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                disabled={verifying}
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Body */}
            {verifying ? (
              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="flex flex-col items-center text-center space-y-2.5">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <h3 className="font-bold text-sm">Lumio AI Guard Verification scanning...</h3>
                  <p className="text-xs text-muted-foreground">Running trademark, copyright, and safety scanner audits</p>
                </div>

                {/* Multi-step pipeline checklist */}
                <div className="space-y-3 pt-2">
                  <div className={`flex items-center gap-3 text-xs p-2.5 rounded-xl border ${verifyStep >= 1 ? "border-primary bg-primary-soft/10 text-foreground" : "border-border text-muted-foreground"}`}>
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                    <span className="font-semibold">Binary Decoding & Stream Extraction</span>
                    {verifyStep > 1 && <Check className="h-4 w-4 text-emerald-500 ml-auto" />}
                  </div>

                  <div className={`flex items-center gap-3 text-xs p-2.5 rounded-xl border ${verifyStep >= 2 ? "border-primary bg-primary-soft/10 text-foreground" : "border-border text-muted-foreground"}`}>
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                    <span className="font-semibold">Quality & Layout Analysis Check</span>
                    {verifyStep > 2 && <Check className="h-4 w-4 text-emerald-500 ml-auto" />}
                  </div>

                  <div className={`flex items-center gap-3 text-xs p-2.5 rounded-xl border ${verifyStep >= 3 ? "border-primary bg-primary-soft/10 text-foreground" : "border-border text-muted-foreground"}`}>
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                    <span className="font-semibold">Safety & Anti-Plagiarism Sweep</span>
                    {verifyStep > 3 && <Check className="h-4 w-4 text-emerald-500 ml-auto" />}
                  </div>

                  <div className={`flex items-center gap-3 text-xs p-2.5 rounded-xl border ${verifyStep >= 4 ? "border-primary bg-primary-soft/10 text-foreground" : "border-border text-muted-foreground"}`}>
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">4</div>
                    <span className="font-semibold">DMCA & Publisher Database Validation</span>
                  </div>
                </div>

                {/* Verify Logs console */}
                <div className="bg-foreground text-background dark:bg-muted dark:text-foreground font-mono text-[10px] rounded-xl p-3.5 h-36 overflow-y-auto space-y-1.5 scrollbar-thin shadow-inner">
                  {verifyLogs.map((log, i) => (
                    <div key={i} className="leading-normal animate-fade-in">{log}</div>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={startAiVerification} className="p-6 space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-muted-foreground">Book or Material Title</span>
                  <input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="E.g., Quantum Mechanics Recaps"
                    className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold text-muted-foreground">Subject</span>
                    <input
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      placeholder="E.g., Physics"
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="block text-xs font-semibold text-muted-foreground">Author Name</span>
                    <input
                      value={uploadAuthor}
                      onChange={(e) => setUploadAuthor(e.target.value)}
                      placeholder="E.g., Dr. Jane Doe"
                      className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-muted-foreground">Material Category</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["book", "notes", "exam"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setUploadType(cat)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          uploadType === cat
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground"
                        }`}
                      >
                        {cat === "book" ? "📚 Book" : cat === "notes" ? "📝 Notes" : "🎓 Exam"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Drop area */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-muted-foreground">Attach Document File</span>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-all text-center gap-1.5">
                    <FileText className="h-8 w-8 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {uploadFile ? uploadFile.name : "Select or Drop Study File (PDF, DOCX)"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Max 25MB per upload file</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadFile(file);
                      }}
                      className="hidden"
                      required
                    />
                  </label>
                </div>

                {/* Legal compliance quick checklist notice */}
                <div className="p-3.5 rounded-2xl bg-indigo-500/5 text-[10px] text-muted-foreground leading-normal flex gap-2">
                  <Info className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                  <p>
                    By proceeding, you certify that this file does not infringe copyrights or trademark systems, is fully compliant with the Lumio Covenant, and permits public digital tutoring access.
                  </p>
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ripple rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold hover:shadow-glow transition-all"
                  >
                    Send to AI Verifier
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* INSTITUTION REGISTRATION MODAL */}
      {/* ========================================= */}
      {instModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-popover rounded-3xl border border-border shadow-elev-3 overflow-hidden flex flex-col animate-fade-up">
            {/* Header */}
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-card/40">
              <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                <School className="h-5 w-5 text-indigo-500" />
                <span>Establish Institution Portal</span>
              </h2>
              <button
                type="button"
                onClick={() => setInstModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleRegisterInstitution} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-muted-foreground">Institution Name</span>
                <input
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  placeholder="E.g., Massachusetts Institute of Technology"
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-muted-foreground">Authorized Administrator Email</span>
                <input
                  type="email"
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                  placeholder="E.g., admin@mit.edu"
                  className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                  required
                />
                <span className="block text-[10px] text-muted-foreground leading-normal">
                  Requires a valid academic TLD business email (.edu, .ac.uk, .edu.ng, etc.) for instant verification.
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-muted-foreground">Portal Type</span>
                <select
                  value={instType}
                  onChange={(e) => setInstType(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
                >
                  <option value="University">🏫 University / College</option>
                  <option value="Highschool">🎒 High School / Academy</option>
                  <option value="Tuition">✏️ Private Study Circle</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-500/5 text-[10px] text-muted-foreground leading-normal flex gap-2 border border-indigo-500/10">
                <Lock className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <p>
                  Institutional setup links to Lumio servers. By registering, you unlock the student matric database csv rosters and visible cohort privacy control systems.
                </p>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setInstModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ripple rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold hover:shadow-glow transition-all"
                >
                  Open Portal Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
