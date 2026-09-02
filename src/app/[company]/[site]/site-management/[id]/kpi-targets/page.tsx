import { KpiTargetsPage } from "@/components/features/kpi-targets/KpiTargetsPage";

export default async function OrgSiteKpiTargetsRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <KpiTargetsPage siteId={Number(id)} />;
}
