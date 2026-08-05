import type { LoginPayload } from "@/dtos/req/auth.req";
import type { LoginResponse } from "@/dtos/res/auth.res";
import { setAuthEmail, setAuthRole, setOrgToken } from "@/lib/auth-tokens";
import axiosInstance from "@/lib/axiosInstance";

/**
 * POST /AdminPortalAuth/login
 *
 * The single login for this portal. The backend resolves whether the email belongs to
 * CodeSwift staff or to a customer's own admin and tags the response with `accountType`;
 * everything else in the response is exactly what the underlying login would have returned,
 * so the MFA and select-company steps that follow are unchanged.
 *
 * A wrong password returns an identical 401 whichever kind of account it was, and no
 * `accountType`, so nothing here can be used to discover who is staff.
 */
export async function portalLogin(payload: LoginPayload) {
  const { data } = await axiosInstance.post<LoginResponse>(
    "/AdminPortalAuth/login",
    payload,
  );

  setAuthEmail(payload.email);

  // A tenant admin with MFA off is handed a session outright. Staff never are: MFA is
  // mandatory for them, so their branch always continues to an MFA step instead.
  if (data.accountType === "tenant" && data.accessToken) {
    setOrgToken(data.accessToken);
    setAuthRole("admin");
  }

  return data;
}
