/** Flat body from POST /SuperAdminAuth/login — not wrapped in ApiResponse. */
export type SuperAdminLoginResponse = {
  mfaRequired?: boolean;
  mfaSetupRequired?: boolean;
  mfaToken?: string;
  accessToken?: string;
  refreshToken?: string | null;
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
