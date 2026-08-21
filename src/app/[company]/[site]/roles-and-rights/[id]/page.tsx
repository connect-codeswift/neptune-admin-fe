import { RoleDetailPage } from "@/components/features/roles-and-rights/RoleDetailPage";

type Props = Readonly<{
  params: Promise<{ company: string; site: string; id: string }>;
}>;

export default async function OrgSiteRoleDetailRoute({ params }: Props) {
  const { id } = await params;
  return <RoleDetailPage roleId={id} />;
}
