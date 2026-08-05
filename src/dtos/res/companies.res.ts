export type SuperAdminCompanyResponse = {
  id: number;
  name: string;
  activatedModules: string;
  createdAt: string;
  updatedAt: string;
  siteCount: number;
  userCount: number;
};

export type SuperAdminSiteResponse = {
  id: number;
  siteName: string;
  location: string;
  industryType: string;
  siteSize: string;
  userCount: number;
};

export type SuperAdminCompaniesPageResponse = {
  data?: SuperAdminCompanyResponse[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
};
