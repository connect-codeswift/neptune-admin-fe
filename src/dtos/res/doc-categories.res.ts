/** GET /Document/GetAllCategories item */
export type DocCategoryResponse = {
  id: number;
  categorytName: string;
  siteId: number;
  description?: string | null;
  color?: string | null;
  slug?: string | null;
  isRequired?: boolean;
  requiresApprovalWorkflow?: boolean;
  retentionDays?: number | null;
  documentCount?: number;
};

/** POST /Document/AddCategory */
export type AddDocCategoryPayload = {
  categorytName: string;
  description?: string | null;
  color?: string | null;
  isRequired?: boolean;
  requiresApprovalWorkflow?: boolean;
  retentionDays?: number | null;
};

/** PUT /Document/Category/{id} */
export type UpdateDocCategoryPayload = {
  categorytName?: string | null;
  description?: string | null;
  color?: string | null;
  isRequired?: boolean | null;
  requiresApprovalWorkflow?: boolean | null;
  retentionDays?: number | null;
};

export type DocCategoryStatsResponse = {
  totalCategories?: number;
  requiredCategories?: number;
  categoriesWithDocuments?: number;
  totalDocuments?: number;
};

export type DocDashboardKpisResponse = {
  totalDocuments?: number;
  pendingApproval?: number;
  expiringSoon?: number;
  overdueReview?: number;
};
