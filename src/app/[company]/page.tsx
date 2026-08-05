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
  if (company === "super") {
    redirect("/super/dashboard");
  }

  const siteId = getDefaultSiteIdForOrg(company);
  redirect(buildOrgSitePath(company, siteId));
}
