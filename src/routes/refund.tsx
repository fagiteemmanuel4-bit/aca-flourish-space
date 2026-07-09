import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Spoude" },
      { name: "description", content: "The refund policy that governs your purchases on Spoude." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" updated="June 29, 2026">
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
          ⚠️ <strong>Disclaimer:</strong> This is a standard draft. Before using this policy for
          real launch, please ensure a legal professional reviews it.
        </p>
      </div>
      <Section title="1. Overview">
        <p>
          Spoude provides premium passes, subscription plans, and micro top-up packs ("Energy") to
          facilitate AI tutoring sessions, timed mock exams, and flashcard generation. Due to the
          high server costs associated with GPU processing and LLM inference, we enforce a strict
          refund policy as detailed below.
        </p>
      </Section>
      <Section title="2. Subscription Pass Renewals">
        <p>
          Standard Pass and Premium Season Pass plans are billed on a recurring 3-month basis. You
          may cancel your pass at any time before your renewal billing date. No partial refunds are
          issued for cancellations requested mid-season; cancellation will take effect at the end of
          your current active billing cycle.
        </p>
      </Section>
      <Section title="3. Micro Top-Ups (Spark/Boost Packs)">
        <p>
          Micro top-up energy purchases (Spark Pack, Boost Pack) are fully non-refundable once the
          transaction is authorized and energy is credited to your balance. Under no circumstances
          will unused energy balances be exchanged for cash values or refunds once loaded.
        </p>
      </Section>
      <Section title="4. Technical Failures">
        <p>
          In the event of rare system-wide or payment gateway failures (e.g. Flutterwave issues)
          where credits fail to load onto your profile but money was debited, please contact our
          support desk via Featurebase or email at{" "}
          <a className="text-primary hover:underline" href="mailto:support@spoude.io">
            support@spoude.io
          </a>
          . We will manually reconcile your energy balance or issue a refund within 3-5 business
          days.
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
