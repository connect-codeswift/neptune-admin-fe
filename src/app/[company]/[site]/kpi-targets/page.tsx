import { KpiTargetsPage } from "@/components/features/kpi-targets/KpiTargetsPage";

export default async function OrgSiteKpiTargetsRoute({
  params,
}: Readonly<{
  params: Promise<{ site: string }>;
}>) {
  const { site } = await params;
  return <KpiTargetsPage siteId={Number(site)} />;
}
