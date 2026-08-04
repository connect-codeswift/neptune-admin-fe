import type { ApiResponse } from "@/types/api.types";

type PaginatedModel<T> = {
  items?: T[];
  data?: T[];
  records?: T[];
  totalCount?: number;
};

export function unwrapDataModel<T>(response: ApiResponse): T | undefined {
  return response.dataModel as T | undefined;
}

export function unwrapList<T>(response: ApiResponse): T[] {
  const model = response.dataModel;

  if (Array.isArray(model)) {
    return model as T[];
  }

  if (model && typeof model === "object") {
    const paginated = model as PaginatedModel<T>;
    if (Array.isArray(paginated.items)) return paginated.items;
    if (Array.isArray(paginated.data)) return paginated.data;
    if (Array.isArray(paginated.records)) return paginated.records;
  }

  return [];
}

export function assertApiSuccess(response: ApiResponse, fallback: string): void {
  if (response.success === false || response.isError) {
    throw new Error(response.message || response.errorDetails || fallback);
  }
}
