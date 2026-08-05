"use client";

import { NumberInput } from "@/components/inputs";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { EHS_MODULES } from "@/lib/ehs-modules";
import {
  DEFAULT_MODULE_PRICES,
  DEFAULT_PRICING_RATES,
  type PricingRates,
} from "@/lib/pricing-rates";

type RatesEditorProps = Readonly<{
  rates: PricingRates;
  onChange: (rates: PricingRates) => void;
}>;

function ModulePricesEditor({ rates, onChange }: RatesEditorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {EHS_MODULES.map((module) => (
        <NumberInput
          key={module.id}
          label={`${module.label} (USD/yr)`}
          min={0}
          step={10}
          showStepper
          value={String(rates.modulePrices[module.id] ?? 0)}
          onChange={(event) =>
            onChange({
              ...rates,
              modulePrices: {
                ...rates.modulePrices,
                [module.id]: Number(event.target.value) || 0,
              },
            })
          }
          onReset={() =>
            onChange({
              ...rates,
              modulePrices: {
                ...rates.modulePrices,
                [module.id]: DEFAULT_MODULE_PRICES[module.id] ?? 0,
              },
            })
          }
        />
      ))}
    </div>
  );
}

export function PricingRatesCard({ rates, onChange }: RatesEditorProps) {
  return (
    <div className="flex flex-col gap-5">
      <DetailCard
        title="Base Rates"
        description="All contracts are billed yearly. These rates seed every new subscription — changing them never alters a subscription that is already signed."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberInput
            label="Price Per User (USD/yr)"
            min={0}
            step={10}
            showStepper
            value={String(rates.pricePerUser)}
            onChange={(event) =>
              onChange({
                ...rates,
                pricePerUser: Number(event.target.value) || 0,
              })
            }
            onReset={() =>
              onChange({
                ...rates,
                pricePerUser: DEFAULT_PRICING_RATES.pricePerUser,
              })
            }
            helperText="Charged for every licensed user."
          />
          <NumberInput
            label="Price Per Site (USD/yr)"
            min={0}
            step={10}
            showStepper
            value={String(rates.pricePerSite)}
            onChange={(event) =>
              onChange({
                ...rates,
                pricePerSite: Number(event.target.value) || 0,
              })
            }
            onReset={() =>
              onChange({
                ...rates,
                pricePerSite: DEFAULT_PRICING_RATES.pricePerSite,
              })
            }
            helperText="Same rate for every site: sites × this price."
          />
        </div>
      </DetailCard>

      <DetailCard
        title="Module Prices"
        description="Set a different annual price for each module. Premium modules can cost more."
      >
        <ModulePricesEditor rates={rates} onChange={onChange} />
      </DetailCard>
    </div>
  );
}
