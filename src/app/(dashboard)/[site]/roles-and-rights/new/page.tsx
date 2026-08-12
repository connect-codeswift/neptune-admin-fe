import { RoleEditor } from "@/components/features/roles";

export default function NewRolePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-slate-900">New role</h1>
      <RoleEditor />
    </div>
  );
}
