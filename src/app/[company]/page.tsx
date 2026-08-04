import { redirect } from "next/navigation";
import {
  buildOrgSitePath,
  getDefaultSiteIdForOrg,
} from "@/lib/org-sites";

export default async function CompanyIndexPage({
  params,
}: Readonly<{
  params: Promise<{ company: string }>;
}>) {
  const { company } = await params;
  const siteId = getDefaultSiteIdForOrg(company);
  redirect(buildOrgSitePath(company, siteId));
}
