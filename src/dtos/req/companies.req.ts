export type UpdateCompanyProfilePayload = {
  name?: string | null;
  code?: string | null;
  industry?: string | null;
  legalName?: string | null;
  website?: string | null;
  employeeCount?: number | null;
  complianceZone?: string | null;
  primaryContactName?: string | null;
  primaryContactTitle?: string | null;
  primaryContactEmail?: string | null;
  primaryContactPhone?: string | null;
};

export type UpdateActivatedModulesPayload = {
  activatedModules?: string | null;
};

export type CreateSuperAdminSitePayload = {
  siteName: string;
  location: string;
  industryType?: string | null;
  siteSize?: string | null;
  timeZoneId?: string | null;
};

export type UpdateSuperAdminSitePayload = {
  siteName?: string | null;
  location?: string | null;
  industryType?: string | null;
  siteSize?: string | null;
  timeZoneId?: string | null;
};
