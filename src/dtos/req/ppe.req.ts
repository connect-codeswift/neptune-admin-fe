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
};
