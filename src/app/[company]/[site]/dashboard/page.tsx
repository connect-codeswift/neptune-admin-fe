import { redirect } from "next/navigation";
import { buildOrgSitePath } from "@/lib/org-sites";

export default async function OrgSiteDashboardAliasPage({
  params,
}: Readonly<{
  params: Promise<{ company: string; site: string }>;
}>) {
  const { company, site } = await params;
  redirect(buildOrgSitePath(company, site));
}
