import type { SuperAdminCompanyDetailResponse } from "@/dtos/res/companies.res";

export type OrganizationSeatLimitInfo = {
  seatsUsed: number;
  seatsTotal: number;
  seatsAvailable: number;
};

export type OrganizationSiteLimitInfo = {
  sitesUsed: number;
  sitesTotal: number;
  sitesAvailable: number;
};

export function toSeatLimitInfo(
  company: Pick<
    SuperAdminCompanyDetailResponse,
    "seatsUsed" | "maxSeats" | "seatsAvailable" | "atSeatLimit"
  >,
): OrganizationSeatLimitInfo | null {
  if (company.maxSeats == null) return null;
  return {
    seatsUsed: company.seatsUsed ?? 0,
    seatsTotal: company.maxSeats,
    seatsAvailable: company.seatsAvailable ?? 0,
  };
}

export function toSiteLimitInfo(
  company: Pick<
    SuperAdminCompanyDetailResponse,
    "sitesUsed" | "maxSites" | "sitesAvailable" | "atSiteLimit"
  >,
): OrganizationSiteLimitInfo | null {
  if (company.maxSites == null) return null;
  return {
    sitesUsed: company.sitesUsed ?? 0,
    sitesTotal: company.maxSites,
    sitesAvailable: company.sitesAvailable ?? 0,
  };
}

export function getSeatUsagePercent(info: OrganizationSeatLimitInfo): number {
  if (info.seatsTotal <= 0) return 100;
  return Math.min(
    100,
    Math.round((info.seatsUsed / info.seatsTotal) * 100),
  );
}

export function getSiteUsagePercent(info: OrganizationSiteLimitInfo): number {
  if (info.sitesTotal <= 0) return 100;
  return Math.min(
    100,
    Math.round((info.sitesUsed / info.sitesTotal) * 100),
  );
}

export function getSeatLimitMessage(info: OrganizationSeatLimitInfo): string {
  if (info.seatsAvailable <= 0) {
    return "You have reached your seat limit. Adding more users beyond your plan allowance will require a plan upgrade.";
  }
  return "You are approaching your seat limit. Adding more users beyond your plan allowance will require a plan upgrade.";
}

export function getSiteLimitMessage(info: OrganizationSiteLimitInfo): string {
  if (info.sitesAvailable <= 0) {
    return "You have reached your site limit. Adding more sites beyond your allowance will require contacting CodeSwift.";
  }
  return "You are approaching your site limit. Adding more sites may require contacting CodeSwift.";
}

export function formatLimitValue(value: number | null | undefined): string {
  return value == null ? "Unlimited" : String(value);
}
