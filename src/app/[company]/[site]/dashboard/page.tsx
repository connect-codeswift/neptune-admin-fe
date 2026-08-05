import { redirect } from "next/navigation";
import { AdminDashboardPage } from "@/components/features/dashboard/AdminDashboardPage";

export default async function OrgSiteDashboardPage({
  params,
}: Readonly<{
  params: Promise<{ company: string; site: string }>;
}>) {
  const { company, site } = await params;
  if (company === "super") {
    redirect("/super/dashboard");
  }

  // The real company and site names come from the dashboard summary and the
  // tenant context, both client-side. This server component supplies only the
  // ids and a placeholder for first paint.
  return (
    <AdminDashboardPage
      company={company}
      site={site}
      description={`Organization ${company} · Site ${site}`}
    />
  );
}
