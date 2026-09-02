/** Request body for POST /ppe (PPEDto). */
export type CreatePpePayload = {
  id?: number;
  category: string;
  inStock?: number;
  minStock?: number;
  unitCost?: number;
  status?: string | null;
  supplier?: string | null;
  replaceAfter?: string | null;
  inspectionInterval?: string | null;
  availableSize?: string | null;
};

export type GetPpeListPayload = {
  pageNumber?: number;
  pageSize?: number;
  /**
   * Omitted = the token's site, exactly as before. An explicit id is honoured
   * only for a live site the caller is a member of; anything else returns 404
   * ("Site not found for this company."). See FEGuides/Ppe.md §3.
   */
  siteId?: number;
};
