import type { LocationResponse } from "@/dtos/res/locations.res";
import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

/**
 * GET /v1/locations — not paginated, name-ordered. Omit `siteId` for the token's site,
 * unchanged. An explicit `siteId` is honoured only for a live site the caller is a member
 * of — anything else 404s with "Site not found for this company."
 */
export async function getLocations(params?: { siteId?: number; search?: string }) {
  const { data } = await axiosInstance.get<ApiResponse<LocationResponse[]>>(
    "/v1/locations",
    params && Object.keys(params).length > 0 ? { params } : undefined,
  );
  return data;
}
