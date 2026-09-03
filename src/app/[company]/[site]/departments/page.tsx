import { DepartmentsPage } from "@/components/features/departments/DepartmentsPage";

export default async function OrgSiteDepartmentsRoute({
  params,
}: Readonly<{
  params: Promise<{ site: string }>;
}>) {
  const { site } = await params;
  return <DepartmentsPage siteId={Number(site)} />;
}
