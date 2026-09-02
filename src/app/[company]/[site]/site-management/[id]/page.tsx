import { SiteDetailPage } from "@/components/features/site-management/SiteDetailPage";

export default async function OrgSiteSiteDetailRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <SiteDetailPage siteId={id} />;
}
