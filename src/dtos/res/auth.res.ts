/** Flat body from POST /Auth/login and POST /SuperAdminAuth/login. */
export type LoginResponse = {
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

export type SuperAdminForgotPasswordResponse = unknown;

export type SuperAdminResetPasswordResponse = unknown;

export type SuperAdminBootstrapResponse = unknown;
