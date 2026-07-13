import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Lumio" },
      { name: "description", content: "Learn about the rules regarding payments and refund eligibility on Lumio." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" updated="June 29, 2026">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex gap-3 text-foreground/90 mb-6">
        <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Attorney Advisory Notice</p>
          <p className="leading-relaxed">
            This document represents a default standard Refund Policy. It is designed to outline billing and transaction procedures. Before real-world launch, legal counsel should review these clauses to guarantee compliance with regional and local commercial laws.
          </p>
        </div>
      </div>

      <Section title="1. Energy Packs and Digital Currency">
        <p>
          All micro-purchases made on the Lumio platform, including but not limited to Spark Packs (₦200) and Boost Packs (₦500), are credited instantly to your account as non-refundable, non-transferable digital energy units.
        </p>
        <p>
          Energy units have no real-world cash equivalence and cannot be liquidated or withdrawn as fiat currency. Once an energy unit has been spent (e.g., to run a mock exam, request deep explanations, or generate flashcards), that transaction is final.
        </p>
      </Section>

      <Section title="2. Premium Season Passes and Subscriptions">
        <p>
          Lumio provides a Standard Pass (₦1,500) and Premium Season Pass (₦3,000) that grant access to energy allowances or unlimited mock examination services over a 3-month season duration.
        </p>
        <p>
          Unless otherwise mandated by local laws, season passes are non-refundable once purchased. By initiating a purchase, you acknowledge and agree that your access is immediate and that you waive any applicable statutory cooling-off rights.
        </p>
      </Section>

      <Section title="3. Exceptional Refund Circumstances">
        <p>
          Refunds may be evaluated on a strictly discretionary, case-by-case basis under the following verified technical situations:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Double Billing:</strong> If the payment processing system (Flutterwave/Korapay) mistakenly executes duplicate debits for a single transaction.</li>
          <li><strong>Systemic Platform Outage:</strong> If a major technical failure disables access to season pass benefits for a continuous duration exceeding 72 hours.</li>
        </ul>
      </Section>

      <Section title="4. Abuse of Refund Procedures">
        <p>
          We monitor refunds carefully. Any user who requests multiple refunds or initiates fraudulent chargeback requests faces permanent account suspension, streak revocation, and full asset forfeiture.
        </p>
      </Section>

      <Section title="5. Contact Information">
        <p>
          For payment questions, duplicate invoice records, or assistance with energy credits, please contact our billing desk at <a className="text-primary hover:underline" href="mailto:billing@lumio.io">billing@lumio.io</a>.
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
