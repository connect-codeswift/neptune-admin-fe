import { PpeCatalogPage } from "@/components/features/ppe-catalog/PpeCatalogPage";

export default async function OrgSitePpeCatalogRoute({
  params,
}: Readonly<{
  params: Promise<{ site: string }>;
}>) {
  const { site } = await params;
  return <PpeCatalogPage siteId={Number(site)} />;
}
