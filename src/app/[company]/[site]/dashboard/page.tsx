import { redirect } from "next/navigation";
import { AdminDashboardPage } from "@/components/features/dashboard/AdminDashboardPage";
import { getDummyOrganization } from "@/lib/dummy-organizations";

export default async function OrgSiteDashboardPage({
  params,
}: Readonly<{
  params: Promise<{ company: string; site: string }>;
}>) {
  const { company, site } = await params;
  if (company === "super") {
    redirect("/super/dashboard");
  }

  const org = getDummyOrganization(company);
  const siteName =
    org?.sites.find((entry) => entry.id === site)?.name ?? `Site ${site}`;
  const description = org
    ? `${org.name} · ${siteName}`
    : `Organization ${company} · Site ${site}`;

  return <AdminDashboardPage description={description} />;
}
