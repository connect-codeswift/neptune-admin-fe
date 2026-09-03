import { UserDetailPage } from "@/components/features/user-management/UserDetailPage";

export default async function OrgSiteUserDetailRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <UserDetailPage userId={id} />;
}
