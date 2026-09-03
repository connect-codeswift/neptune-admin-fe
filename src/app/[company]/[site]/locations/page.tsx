import { LocationsPage } from "@/components/features/locations/LocationsPage";

export default async function OrgSiteLocationsRoute({
  params,
}: Readonly<{
  params: Promise<{ site: string }>;
}>) {
  const { site } = await params;
  return <LocationsPage siteId={Number(site)} />;
}
