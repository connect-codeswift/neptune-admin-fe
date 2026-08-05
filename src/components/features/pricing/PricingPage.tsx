"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { DEFAULT_PRICING_RATES, type PricingRates } from "@/lib/pricing-rates";
import { PricingRatesCard } from "./PricingRatesCard";

export function PricingPage() {
  const [rates, setRates] = useState<PricingRates>(DEFAULT_PRICING_RATES);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Pricing"
        description="The rate card your team quotes from — per user, per site, and per module. Yearly contracts only."
        breadcrumbs={[
          { label: "Super Admin", href: "/super/dashboard" },
          { label: "Pricing" },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:refresh-cw"
              onClick={() => {
                setRates(DEFAULT_PRICING_RATES);
                toast.success("Rate card reset to defaults.");
              }}
            >
              Reset Defaults
            </Button>
            <Button
              size="sm"
              leftIcon="lucide:check"
              onClick={() => toast.success("Rate card saved.")}
            >
              Save Rates
            </Button>
          </>
        }
      />

      <div className="rounded-[20px] border border-blue-normal/20 bg-blue-normal/8 px-5 py-4">
        <p className="text5 text-darkest">
          These are defaults only. Each client&apos;s agreed prices are frozen on
          their subscription, so editing a rate here affects new subscriptions
          only.
        </p>
        <Link
          href="/super/subscriptions"
          className="mt-1 inline-flex items-center gap-1 text6 font-semibold text-blue-normal hover:underline"
        >
          Go to Subscriptions
        </Link>
      </div>

      <PricingRatesCard rates={rates} onChange={setRates} />
    </div>
  );
}
