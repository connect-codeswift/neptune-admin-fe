export type SuperAdminCompanyResponse = {
  id: number;
  name: string;
  activatedModules: string;
  createdAt: string;
  updatedAt: string;
  siteCount: number;
  userCount: number;
  accessExpiresAt?: string | null;
  daysRemaining?: number | null;
};

export type SuperAdminCompanyDetailResponse = SuperAdminCompanyResponse & {
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
  sites?: SuperAdminSiteResponse[];
};

export type SuperAdminSiteResponse = {
  id: number;
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
  userCount: number;
  timeZoneId?: string | null;
  isDrop?: boolean;
};

export type SuperAdminCompaniesPageResponse = {
  data?: SuperAdminCompanyResponse[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
};

export type AccessWindowResponse = {
  id: number;
  accessExpiresAt: string;
  accessNote?: string | null;
};

export type AccessHistoryRow = {
  id: number;
  action: "Granted" | "Extended" | "Cleared" | string;
  previousExpiresAt?: string | null;
  newExpiresAt?: string | null;
  note?: string | null;
  superAdminId: number;
  createdAt: string;
};
