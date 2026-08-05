/**
 * Canonical EHS module catalog. Pricing, subscriptions, and client module
 * views all read from here so module ids never drift between screens.
 */
export type EhsModule = {
  id: string;
  label: string;
};

export const EHS_MODULES: readonly EhsModule[] = [
  { id: "incident-reporting", label: "Incident Reporting" },
  { id: "hazard-management", label: "Hazard Management" },
  { id: "capa", label: "CAPA" },
  { id: "safety-observations", label: "Safety Observations" },
  { id: "ppe-management", label: "PPE Management" },
  { id: "document-control", label: "Document Control" },
  { id: "compliance-calendar", label: "Compliance Calendar" },
  { id: "training-management", label: "Training Management" },
  { id: "action-plan", label: "Action Plan" },
  { id: "regulation-library", label: "Regulations Library" },
  { id: "loto-procedures", label: "LOTO Procedures" },
  { id: "analytics", label: "Analytics & Reporting" },
] as const;

export function getModuleLabel(moduleId: string): string {
  return EHS_MODULES.find((module) => module.id === moduleId)?.label ?? moduleId;
}

/** Options shaped for `ToggleBadges` / `SelectInput`. */
export function getModuleOptions() {
  return EHS_MODULES.map((module) => ({
    value: module.id,
    label: module.label,
  }));
}
