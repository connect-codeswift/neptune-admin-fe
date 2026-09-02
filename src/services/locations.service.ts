import type { LocationPayload } from "@/dtos/req/locations.req";
import type {
  LocationMutationResponse,
  LocationResponse,
} from "@/dtos/res/locations.res";
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

/**
 * POST /v1/locations — writes always take the site from the caller's token, never from a
 * parameter. Names are unique per site, case-insensitively; a duplicate is a 400 with the
 * name in the message.
 */
export async function createLocation(payload: LocationPayload) {
  const { data } = await axiosInstance.post<ApiResponse<LocationMutationResponse>>(
    "/v1/locations",
    payload,
  );
  return data;
}

/**
 * PUT /v1/locations/{id} — same body and uniqueness rule as create. Every record pointing at
 * the id follows the new name.
 */
export async function updateLocation(id: number, payload: LocationPayload) {
  const { data } = await axiosInstance.put<ApiResponse<LocationMutationResponse>>(
    `/v1/locations/${id}`,
    payload,
  );
  return data;
}

/**
 * DELETE /v1/locations/{id} — soft delete, and it always succeeds. Nothing is removed;
 * referencing records keep resolving the name, the location just leaves the pickers.
 */
export async function deleteLocation(id: number) {
  const { data } = await axiosInstance.delete<ApiResponse>(`/v1/locations/${id}`);
  return data;
}
