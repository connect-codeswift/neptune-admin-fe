import { redirect } from "next/navigation";
import {
  buildDefaultSettingsHref,
  buildTenantSettingsBasePath,
} from "@/components/settings/settings-nav";

/** `/{company}/{site}/settings` has no content of its own — it lands on the Profile tab. */
export default async function OrgSiteSettingsIndexRoute({
  params,
}: Readonly<{
  params: Promise<{ company: string; site: string }>;
}>) {
  const { company, site } = await params;
  redirect(buildDefaultSettingsHref(buildTenantSettingsBasePath(company, site)));
}
