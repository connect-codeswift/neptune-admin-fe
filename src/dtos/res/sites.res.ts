export type SuperAdminSiteRow = {
  id: number;
  siteName: string;
  location: string;
  industryType: string | null;
  siteSize: string | null;
  timeZoneId: string | null;
  isDrop: boolean;
  userCount: number;
};

export type SuperAdminSitesListResponse = SuperAdminSiteRow[];

export type SuperAdminSiteResponse = SuperAdminSiteRow;
