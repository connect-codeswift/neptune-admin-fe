import { EditUserPage } from "@/components/features/user-management/EditUserPage";

export default async function EditUserRoute({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  return <EditUserPage userId={id} />;
}
