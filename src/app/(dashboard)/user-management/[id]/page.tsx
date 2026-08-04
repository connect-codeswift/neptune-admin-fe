import { UserDetailPage } from "@/components/features/user-management/UserDetailPage";

export default async function UserDetailRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <UserDetailPage userId={id} />;
}
