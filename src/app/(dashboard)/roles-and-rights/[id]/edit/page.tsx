import { EditRolePage } from "@/components/features/roles-and-rights/EditRolePage";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditRoleRoute({ params }: Props) {
  const { id } = await params;
  return <EditRolePage roleId={id} />;
}
