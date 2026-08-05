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
  incident: 470,
  "near-miss": 500,
  hazard: 540,
  "lockout-tagout": 780,
  capa: 710,
  audits: 580,
  inspections: 550,
  "policy-maker": 640,
  "regulatory-compliance": 660,
  "behaviour-based-safety": 500,
  "walk-and-talks": 480,
  "ppe-management": 420,
  "industrial-hygiene": 600,
  hazcom: 540,
};

export const DEFAULT_PRICING_RATES: PricingRates = {
  pricePerUser: 140,
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
