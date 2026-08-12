import { RoleEditor } from "@/components/features/roles";

export default async function EditRolePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-slate-900">Edit role</h1>
      <RoleEditor roleId={Number(id)} />
    </div>
  );
}
