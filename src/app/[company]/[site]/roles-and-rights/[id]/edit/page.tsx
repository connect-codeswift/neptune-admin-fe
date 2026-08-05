import { EditRolePage } from "@/components/features/roles-and-rights/EditRolePage";

type Props = Readonly<{
  params: Promise<{ company: string; site: string; id: string }>;
}>;

export default async function OrgSiteEditRoleRoute({ params }: Props) {
  const { id } = await params;
  return <EditRolePage roleId={id} />;
}
