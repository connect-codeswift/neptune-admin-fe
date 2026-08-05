/** Single PPE catalog item from GET /ppe or GET /ppe/{id}. */
export type PpeResponse = {
  id?: number;
  category?: string;
  inStock?: number;
  minStock?: number;
  unitCost?: number;
  status?: string | null;
  supplier?: string | null;
  replaceAfter?: string | null;
  inspectionInterval?: string | null;
  availableSize?: string | null;
};

export type PpeKpiResponse = unknown;

export type PpeKpiInventoryResponse = unknown;
