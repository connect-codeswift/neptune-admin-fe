export type SuperAdminLoginPayload = {
  email: string;
  password: string;
};

export type VerifyMfaPayload = {
  mfaToken: string;
  code: string;
};

export type SuperAdminMfaSetupPayload = {
  mfaToken: string;
};

export type SuperAdminSelectCompanyPayload = {
  organizationId: number;
  siteId: number;
};
