/** Request body for POST /Compliance/AddCompliance. */
export type ComplianceCreatePayload = {
  title: string;
  category: "Regulatory" | "Safety" | "Health" | string;
  code?: string | null;
  jurisdiction?: "Federal" | "State" | "Local" | string | null;
  regulatoryBody: string;
  dueDate: string;
  recurrence?:
    | "One-time"
    | "Weekly"
    | "Monthly"
    | "Quarterly"
    | "Annual"
    | "Annually"
    | "None"
    | string
    | null;
  responsiblePersonId: number;
  priority?: string | null;
  evidenceUrls?: string[] | null;
};

/** Request body for POST /Compliance/GetAllCompliances. */
export type ComplianceGridFilterPayload = {
  pageNumber?: number;
  pageSize?: number;
  search?: string | null;
  jurisdiction?: string | null;
  status?: string | null;
};

/** Request body for PUT /Compliance/Update. */
export type ComplianceUpdatePayload = {
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
