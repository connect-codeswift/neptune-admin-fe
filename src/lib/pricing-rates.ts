import { EHS_MODULES } from "@/lib/ehs-modules";

/**
 * Global rate card. These are the platform defaults a salesman quotes from —
 * they seed a new subscription but never alter one that is already signed.
 */
export type PricingRates = {
  /** Annual fee per licensed user. */
  pricePerUser: number;
  /** Annual fee per site — the same rate for every site. */
  pricePerSite: number;
  /** Annual fee per module (each module can differ). */
  modulePrices: Record<string, number>;
};

export const DEFAULT_MODULE_PRICES: Record<string, number> = {
  "incident-reporting": 468,
  "hazard-management": 540,
  capa: 708,
  "safety-observations": 504,
  "ppe-management": 420,
  "document-control": 576,
  "compliance-calendar": 552,
  "training-management": 636,
  "action-plan": 624,
  "regulation-library": 660,
  "loto-procedures": 780,
  analytics: 1188,
};

export const DEFAULT_PRICING_RATES: PricingRates = {
  pricePerUser: 144,
  pricePerSite: 600,
  modulePrices: { ...DEFAULT_MODULE_PRICES },
};

export function getModulePrice(rates: PricingRates, moduleId: string): number {
  return rates.modulePrices[moduleId] ?? 0;
}

/** Modules that have a price on the current rate card. */
export function getPriceableModules(rates: PricingRates) {
  return EHS_MODULES.filter(
    (module) => rates.modulePrices[module.id] !== undefined,
  );
}
