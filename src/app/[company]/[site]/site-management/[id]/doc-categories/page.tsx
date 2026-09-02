import { DocumentCategoriesPage } from "@/components/features/doc-categories/DocumentCategoriesPage";

export default async function OrgSiteDocCategoriesRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <DocumentCategoriesPage siteId={Number(id)} />;
}
