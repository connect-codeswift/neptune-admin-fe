import { RolesTable } from "@/components/features/roles";

export default function RolesAndRightsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Roles &amp; Rights</h1>
        <p className="text-sm text-slate-500">
          Control which modules each role can see, and what it can do in them.
        </p>
      </div>
      <RolesTable />
    </div>
  );
}
