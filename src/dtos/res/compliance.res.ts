/** Compliance record from Compliance API (maps to regulation library UI). */
export type ComplianceResponse = {
  id?: number;
  code?: string | null;
  title?: string | null;
  category?: string | null;
  jurisdiction?: string | null;
  regulatoryBody?: string | null;
  dueDate?: string;
  nextDue?: string;
  recurrence?: string | null;
  responsiblePersonId?: number;
  responsiblePerson?: string | null;
  priority?: string | null;
  status?: string | null;
  completedDate?: string | null;
  completedBy?: number | null;
  completedByName?: string | null;
  evidenceUrls?: string[] | null;
  markComplete?: boolean;
  nextCycleId?: number | null;
  nextCycleDueDate?: string | null;
};

export type ComplianceDashboardKpisResponse = unknown;
