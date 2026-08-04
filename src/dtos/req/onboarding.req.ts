/** Nested site object for POST /Auth/register (UserDto.sites). */
export type RegisterSitePayload = {
  id?: number;
  industryType: string;
  siteSize: string;
  siteName: string;
  location: string;
};

/** Request body for POST /Auth/register (UserDto). */
export type RegisterPayload = {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string;
  roleId: number;
  organizationId: number;
  organizationName: string;
  activatedModules: string;
  invitedBy?: number | null;
  sites: RegisterSitePayload[];
};
