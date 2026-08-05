/**
 * Canonical EHS module catalog. Pricing, subscriptions, and client module
 * views all read from here so module ids never drift between screens.
 */
export type EhsModule = {
  id: string;
  label: string;
  /** Backend comma-separated module code (e.g. Incident, Hazard, PPE). */
  apiCode: string;
};

export const EHS_MODULES: readonly EhsModule[] = [
  { id: "incident-reporting", label: "Incident Reporting", apiCode: "Incident" },
  { id: "hazard-management", label: "Hazard Management", apiCode: "Hazard" },
  { id: "capa", label: "CAPA", apiCode: "CAPA" },
  { id: "safety-observations", label: "Safety Observations", apiCode: "SafetyObservations" },
  { id: "ppe-management", label: "PPE Management", apiCode: "PPE" },
  { id: "document-control", label: "Document Control", apiCode: "DocumentControl" },
  { id: "compliance-calendar", label: "Compliance Calendar", apiCode: "ComplianceCalendar" },
  { id: "training-management", label: "Training Management", apiCode: "Training" },
  { id: "action-plan", label: "Action Plan", apiCode: "ActionPlan" },
  { id: "regulation-library", label: "Regulations Library", apiCode: "Regulations" },
  { id: "loto-procedures", label: "LOTO Procedures", apiCode: "LOTO" },
  { id: "analytics", label: "Analytics & Reporting", apiCode: "Analytics" },
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
