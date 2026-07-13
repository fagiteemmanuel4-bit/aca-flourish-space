import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/acceptable-use")({
  head: () => ({
    meta: [
      { title: "Acceptable Use Policy — Lumio" },
      { name: "description", content: "Understand the ethical guidelines and academic integrity rules on Lumio." },
    ],
  }),
  component: AcceptableUsePage,
});

function AcceptableUsePage() {
  return (
    <LegalLayout title="Acceptable Use Policy" updated="June 29, 2026">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex gap-3 text-foreground/90 mb-6">
        <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Attorney Advisory Notice</p>
          <p className="leading-relaxed">
            This document outlines the standard code of conduct, academic guidelines, and acceptable content standards for our service. Prior to public release, a qualified legal expert should review these policies to match educational and civil statutes.
          </p>
        </div>
      </div>

      <Section title="1. Purpose and Mission">
        <p>
          Lumio is dedicated to enhancing personal study, review, and retention of knowledge. Our tools (AI Tutoring, Notes, Practice Exams, and Mindmaps) are built to aid intellectual understanding. Lumio is not designed to assist or facilitate academic dishonesty, cheating, or plagiarism.
        </p>
      </Section>

      <Section title="2. Academic Honesty Standards">
        <p>
          As a user of Lumio, you must adhere strictly to your academic institution's code of conduct. The following actions represent a direct violation of this Acceptable Use Policy and will result in instant account ban:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Uploading active homework assignments, active midterms, or assessments to extract answers during an ongoing test.</li>
          <li>Generating material with the intent to submit it as your own work for academic grading without citation or required permissions.</li>
          <li>Facilitating the sharing of proprietary class test banks, instructor solution manuals, or examination answers inside the Public Library catalog.</li>
        </ul>
      </Section>

      <Section title="3. Content Restrictions">
        <p>
          Every file uploaded to the private bookshelf or the public library must be safe, respectful, and fully authorized. You agree not to upload, post, or distribute files containing:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Infringing intellectual property, copyrighted textbooks, or trade secrets without a valid publisher license.</li>
          <li>Hateful, harassing, offensive, or sexually explicit content.</li>
          <li>Malicious scripts, viruses, automated indexing bots, or screen-scraping malware designed to disrupt platform stability.</li>
        </ul>
      </Section>

      <Section title="4. Enforcement and Suspensions">
        <p>
          Lumio reserves the absolute right to investigate any user file or upload queue flagged by our AI Guard or community members. Violations of this policy lead to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Immediate removal of the offending files from the community shelf.</li>
          <li>Suspension or permanent termination of the user account and forfeiture of streaks and badges.</li>
          <li>Reporting severe academic dishonesty directly to institutional administrators if required by school agreements.</li>
        </ul>
      </Section>

      <Section title="5. Contact Us">
        <p>
          To report a violation of academic integrity or platform abuse, please email our review team at <a className="text-primary hover:underline" href="mailto:abuse@lumio.io">abuse@lumio.io</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
