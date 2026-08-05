/** Flat body from POST /Auth/login and POST /SuperAdminAuth/login. */
/** Which kind of account signed in. Returned only by the unified portal login. */
export type PortalAccountType = "staff" | "tenant";

export type LoginResponse = {
  mfaRequired?: boolean;
  mfaSetupRequired?: boolean;
  mfaToken?: string;
  accessToken?: string;
  refreshToken?: string | null;
  /**
   * Present only on a successful `POST /AdminPortalAuth/login`. Never returned on a
   * failure, so it can never be used to probe whether an email is a staff account.
   */
  accountType?: PortalAccountType;
};

export type VerifyMfaResponse = {
  accessToken: string;
  refreshToken?: string | null;
};

export type MfaSetupResponse = {
  mfaSecret: string;
  otpAuthUri: string;
};

export type MfaEnableResponse = {
  accessToken: string;
  mfaEnabled: boolean;
  refreshToken?: string | null;
};

export type SelectCompanyResponse = {
  accessToken: string;
};

export type SuperAdminForgotPasswordResponse = unknown;

export type SuperAdminResetPasswordResponse = unknown;

export type SuperAdminBootstrapResponse = unknown;
