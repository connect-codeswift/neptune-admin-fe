export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyMfaPayload = {
  mfaToken: string;
  code: string;
};

export type OrgEnableMfaPayload = {
  code: string;
};

export type SuperAdminMfaSetupPayload = {
  mfaToken: string;
};

export type SuperAdminSelectCompanyPayload = {
  organizationId: number;
  siteId: number;
};

/** Request body for POST /SuperAdminAuth/create */
export type SuperAdminCreatePayload = {
  email: string;
  fullName: string;
  password: string;
};

/** Request body for POST /SuperAdminAuth/forgot-password */
export type SuperAdminForgotPasswordPayload = {
  email: string;
};

/** Request body for POST /SuperAdminAuth/reset-password */
export type SuperAdminResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

/** Request body for POST /SuperAdminAuth/bootstrap */
export type SuperAdminBootstrapPayload = {
  email: string;
  password: string;
  bootstrapKey: string;
};
