import { PpeCatalogPage } from "@/components/features/ppe-catalog/PpeCatalogPage";

export default async function OrgSiteSitePpeCatalogRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <PpeCatalogPage siteId={Number(id)} />;
}
