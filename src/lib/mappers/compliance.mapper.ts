import type { ComplianceCreatePayload } from "@/dtos/req/compliance.req";
import type { ComplianceResponse } from "@/dtos/res/compliance.res";
import type {
  DummyRegulation,
  RegulationStatus,
} from "@/lib/dummy-regulations";

const UI_CATEGORY_TO_API: Record<string, ComplianceCreatePayload["category"]> =
  {
    safety: "Safety",
    environmental: "Regulatory",
    health: "Health",
    electrical: "Safety",
    ppe: "Safety",
  };

const UI_JURISDICTION_TO_API: Record<
  string,
  NonNullable<ComplianceCreatePayload["jurisdiction"]>
> = {
  "federal-us": "Federal",
  "state-ca": "State",
  "state-tx": "State",
  international: "Federal",
  local: "Local",
};

const UI_REVIEW_CYCLE_TO_RECURRENCE: Record<
  string,
  NonNullable<ComplianceCreatePayload["recurrence"]>
> = {
  quarterly: "Quarterly",
  "semi-annual": "Annually",
  annual: "Annual",
  biennial: "Annually",
  "as-needed": "None",
};

function mapComplianceStatus(status?: string | null): RegulationStatus {
  const normalized = status?.trim().toLowerCase() ?? "";
  if (
    normalized.includes("draft") ||
    normalized.includes("pending") ||
    normalized.includes("upcoming")
  ) {
    return "draft";
  }
  if (
    normalized.includes("archive") ||
    normalized.includes("inactive") ||
    normalized.includes("expired") ||
    normalized.includes("complete")
  ) {
    return "archived";
  }
  return "active";
}

export function mapComplianceToRegulation(
  compliance: ComplianceResponse,
): DummyRegulation {
  const category = compliance.category?.trim();
  const jurisdiction = compliance.jurisdiction?.trim();
  const tags = [category, jurisdiction, compliance.regulatoryBody]
    .filter((value): value is string => Boolean(value?.trim()))
    .map((value) => value.trim());

  return {
    id: String(compliance.id ?? crypto.randomUUID()),
    code: compliance.code?.trim() || "—",
    title: compliance.title?.trim() || "Untitled regulation",
    description:
      compliance.regulatoryBody?.trim() ||
      compliance.category?.trim() ||
      "No description provided.",
    status: mapComplianceStatus(compliance.status),
    isPolicy: category?.toLowerCase() === "regulatory",
    safetyLevel: category?.toLowerCase() === "safety",
    tags: tags.length > 0 ? tags : ["Compliance"],
    compliancePercent: compliance.markComplete ? 100 : 0,
  };
}

export function mapRegulationFormToCreatePayload(input: {
  citationCode: string;
  title: string;
  issuingAgency: string;
  jurisdiction: string;
  category: string;
  effectiveDate: string;
  reviewCycle: string;
  responsiblePersonId?: number;
}): ComplianceCreatePayload {
  const dueDate = input.effectiveDate
    ? new Date(input.effectiveDate).toISOString()
    : new Date().toISOString();

  return {
    title: input.title.trim(),
    code: input.citationCode.trim() || null,
    category: UI_CATEGORY_TO_API[input.category] ?? "Safety",
    jurisdiction: UI_JURISDICTION_TO_API[input.jurisdiction] ?? "Federal",
    regulatoryBody: input.issuingAgency.trim() || "OSHA",
    dueDate,
    recurrence: UI_REVIEW_CYCLE_TO_RECURRENCE[input.reviewCycle] ?? "Annual",
    responsiblePersonId: input.responsiblePersonId ?? 1,
    priority: "Medium",
  };
}

export function mapComplianceResponsesToRegulations(
  items: ComplianceResponse[],
): DummyRegulation[] {
  return items.map(mapComplianceToRegulation);
}

export function getRegulationStatsFromList(regulations: DummyRegulation[]) {
  const activeCount = regulations.filter(
    (regulation) => regulation.status === "active",
  ).length;
  const safetyLevelCount = regulations.filter(
    (regulation) => regulation.safetyLevel,
  ).length;
  const avgCompliance =
    regulations.length === 0
      ? 0
      : Math.round(
          regulations.reduce(
            (sum, regulation) => sum + regulation.compliancePercent,
            0,
          ) / regulations.length,
        );

  return {
    total: regulations.length,
    active: activeCount,
    safetyLevel: safetyLevelCount,
    avgCompliance,
  };
}
