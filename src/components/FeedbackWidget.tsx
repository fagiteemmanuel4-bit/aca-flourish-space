import { useState } from "react";
import { MessageSquare, Star, X, Loader2, Heart, ShieldAlert } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("feedback");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return toast.error("Please sign in to submit feedback");

    if (rating === 0) return toast.error("Please choose a star rating");
    if (!message.trim()) return toast.error("Please type your feedback message");

    setLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        user_id: user.uid,
        user_email: user.email,
        user_name: user.displayName || "User",
        rating,
        category,
        message: message.trim(),
        created_at: new Date().toISOString(),
      });
      toast.success("Thank you! Your feedback has been sent to our administrator dashboard.");
      setRating(0);
      setMessage("");
      setOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Submission failed";
      toast.error("Failed to send feedback: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elev-3 hover:shadow-glow active:scale-95 transition-all group pointer-events-auto cursor-pointer"
        aria-label="Submit Feedback"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="absolute right-14 bg-popover text-popover-foreground text-xs font-bold px-3 py-1.5 rounded-xl border border-border shadow opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
          Send Feedback
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm animate-fade-up">
          <div
            className="relative w-full max-w-md p-6 sm:p-8 rounded-[32px] border border-border shadow-elev-3 overflow-hidden"
            style={{ background: "var(--popover)", color: "var(--popover-foreground)" }}
          >
            {/* Geometric Accent Circles & Triangles (Phase 8 Style Requirement) */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/8 rounded-full blur-xl pointer-events-none" />
            <svg
              className="absolute -bottom-4 -left-4 w-16 h-16 text-indigo-500/10 pointer-events-none"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <polygon points="0,100 100,100 50,0" />
            </svg>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> Share your feedback
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                  Feedback Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "feedback", label: "General Feedback" },
                    { id: "complaint", label: "Submit Complaint" },
                    { id: "bug", label: "Report Bug" },
                    { id: "feature", label: "Request Feature" },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        category === cat.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-secondary text-muted-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Rating */}
              <div className="space-y-1.5 text-center py-2 bg-secondary/30 rounded-2xl border border-border/50">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">
                  How would you rate your experience?
                </label>
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Star
                          className={`h-6 w-6 ${active ? "fill-amber-400" : "text-muted-foreground/30"}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                  Your Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === "complaint"
                      ? "Tell us what went wrong. We review all complaints within 24 hours."
                      : "What suggestions, requests, or comments do you have for Spoude?"
                  }
                  className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                />
              </div>

              {/* Warn on Complaints */}
              {category === "complaint" && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-[11px] text-destructive leading-relaxed">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Your complaint will be reviewed officially. Our system logs user agents and IDs
                    to ensure account verification.
                  </span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer shadow-elev-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
