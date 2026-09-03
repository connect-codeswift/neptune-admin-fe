import { DocumentCategoriesPage } from "@/components/features/doc-categories/DocumentCategoriesPage";

export default async function OrgSiteDocCategoriesRoute({
  params,
}: Readonly<{
  params: Promise<{ site: string }>;
}>) {
  const { site } = await params;
  return <DocumentCategoriesPage siteId={Number(site)} />;
}
