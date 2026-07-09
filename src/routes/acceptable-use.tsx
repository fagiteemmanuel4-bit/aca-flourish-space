import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/acceptable-use")({
  head: () => ({
    meta: [
      { title: "Acceptable Use Policy — Spoude" },
      {
        name: "description",
        content: "The acceptable use rules that govern uploads and studying on Spoude.",
      },
    ],
  }),
  component: AcceptableUsePage,
});

function AcceptableUsePage() {
  return (
    <LegalLayout title="Acceptable Use Policy" updated="June 29, 2026">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
          ⚠️ <strong>Disclaimer:</strong> This is a standard draft. Before using this policy for
          real launch, please ensure a legal professional reviews it.
        </p>
      </div>
      <Section title="1. Academic Integrity">
        <p>
          Spoude is designed for personal study support, tutoring walkthroughs, and exam
          preparation. We strictly prohibit the use of Spoude to facilitate plagiarism, cheat on
          active assessments, or upload current active exam keys that violate your institution's
          code of conduct.
        </p>
      </Section>
      <Section title="2. Prohibited Content">
        <p>
          When uploading PDFs or notes to your private library, or sharing documents on Spoude's
          public library, you must NOT publish:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
          <li>Content that contains malware, viruses, or obfuscated payloads.</li>
          <li>
            Copyrighted textbooks or professional resources that you do not hold licenses or
            publication permissions for.
          </li>
          <li>
            Personally identifiable information of educators, teaching assistants, or classmates
            without active consent.
          </li>
          <li>
            Hate speech, obscene descriptions, harassment guides, or promotional advertisement
            materials.
          </li>
        </ul>
      </Section>
      <Section title="3. AI System Abuse">
        <p>
          You agree not to bypass, reverse engineer, or script interactions with our OpenRouter
          study nodes or AI tutor models. Attempts to scrape responses, trigger malicious
          jailbreaks, or generate bulk spam texts using our system limits will result in an
          immediate account ban with zero refund.
        </p>
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
