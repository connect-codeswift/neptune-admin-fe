/**
 * Canonical EHS module catalog. Pricing, subscriptions, and client module
 * views all read from here so module ids never drift between screens.
 */
export type EhsModule = {
  id: string;
  label: string;
  /** Backend comma-separated module code (e.g. INCIDENT, POLICY_MAKER). */
  apiCode: string;
};

export const EHS_MODULES: readonly EhsModule[] = [
  { id: "incident", label: "Incident", apiCode: "INCIDENT" },
  { id: "near-miss", label: "Near Miss", apiCode: "NEAR_MISS" },
  { id: "hazard", label: "Hazard", apiCode: "HAZARD" },
  { id: "lockout-tagout", label: "Lockout/Tagout", apiCode: "LOCKOUT_TAGOUT" },
  { id: "capa", label: "CAPA", apiCode: "CAPA" },
  { id: "audits", label: "Audits", apiCode: "AUDITS" },
  { id: "inspections", label: "Inspections", apiCode: "INSPECTIONS" },
  {
    id: "policy-maker",
    label: "Policy Maker",
    apiCode: "POLICY_MAKER",
  },
  {
    id: "regulatory-compliance",
    label: "Regulatory Compliance",
    apiCode: "REGULATORY_COMPLIANCE",
  },
  {
    id: "behaviour-based-safety",
    label: "Behaviour Based Safety",
    apiCode: "BEHAVIOUR_BASED_SAFETY",
  },
  { id: "walk-and-talks", label: "Walk and Talks", apiCode: "WALK_AND_TALKS" },
  { id: "ppe-management", label: "PPE Management", apiCode: "PPE_MANAGEMENT" },
  {
    id: "industrial-hygiene",
    label: "Industrial Hygiene",
    apiCode: "INDUSTRIAL_HYGIENE",
  },
  { id: "hazcom", label: "Hazcom", apiCode: "HAZCOM" },
] as const;

export function getModuleLabel(moduleId: string): string {
  return EHS_MODULES.find((module) => module.id === moduleId)?.label ?? moduleId;
}

export function parseActivatedModuleCodes(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function activatedModuleCodesToIds(codes: string[]): string[] {
  const normalized = new Set(codes.map((code) => code.toLowerCase()));
  return EHS_MODULES.filter((module) =>
    normalized.has(module.apiCode.toLowerCase()),
  ).map((module) => module.id);
}

export function moduleIdsToActivatedModules(ids: string[]): string {
  const selected = new Set(ids);
  return EHS_MODULES.filter((module) => selected.has(module.id))
    .map((module) => module.apiCode)
    .join(",");
}

export function getModuleLabelFromApiCode(code: string): string {
  const match = EHS_MODULES.find(
    (module) => module.apiCode.toLowerCase() === code.toLowerCase(),
  );
  return match?.label ?? code;
}

/** Options shaped for `ToggleBadges` / `SelectInput`. */
export function getModuleOptions() {
  return EHS_MODULES.map((module) => ({
    value: module.id,
    label: module.label,
  }));
}
