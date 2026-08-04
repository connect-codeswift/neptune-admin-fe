export type LoginPayload = {
  email: string;
  password: string;
};

/** @deprecated Use LoginPayload */
export type SuperAdminLoginPayload = LoginPayload;

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
