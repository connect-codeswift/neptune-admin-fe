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
