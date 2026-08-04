"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PageHeader, PlaceholderPage } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  getDummyRole,
  getRoleTypeLabel,
  type DummyRole,
} from "@/lib/dummy-roles";
import { RightsSelector } from "./RightsSelector";
import { useRolesAndRightsPaths } from "./useRolesAndRightsPaths";

type EditRolePageProps = Readonly<{
  roleId: string;
}>;

function SummaryRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-darkest/8 py-3 text5 last:border-b-0">
      <span className="text-gray">{label}</span>
      <span className="text-right font-semibold text-darkest">{value}</span>
    </div>
  );
}

function RoleSummaryCard({
  role,
  grantedCount,
}: Readonly<{ role: DummyRole; grantedCount: number }>) {
  return (
    <DetailCard title="Role Summary">
      <SummaryRow label="Users assigned" value={String(role.userCount)} />
      <SummaryRow label="Type" value={getRoleTypeLabel(role)} />
      <SummaryRow label="Rights" value={`${grantedCount} granted`} />
      <SummaryRow label="Created" value={role.createdAt ?? "—"} />
      <SummaryRow label="Last modified" value={role.lastModifiedAt ?? "—"} />
    </DetailCard>
  );
}

export function EditRolePage({ roleId }: EditRolePageProps) {
  const router = useRouter();
  const { adminHref, basePath } = useRolesAndRightsPaths();
  const role = getDummyRole(roleId);
  const [selectedRights, setSelectedRights] = useState<string[]>(
    role?.rights ?? [],
  );

  if (!role) {
    return (
      <PlaceholderPage
        title="Role Not Found"
        description={`No role exists with id "${roleId}".`}
      />
    );
  }

  if (role.isSystem) {
    return (
      <PlaceholderPage
        title="System Role"
        description="System roles cannot be edited."
      />
    );
  }

  const handleSave = () => {
    toast.success("Role saved.");
    router.push(basePath);
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title={`Role: ${role.name}`}
        description={role.description}
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Roles & Rights", href: basePath },
          { label: role.name },
        ]}
        actions={
          <Button size="sm" leftIcon="lucide:save" onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DetailCard
          title="Rights"
          action={
            <span className="text5 text-gray">
              {selectedRights.length} granted
            </span>
          }
        >
          <RightsSelector
            selected={selectedRights}
            onChange={setSelectedRights}
            showHeader={false}
          />
        </DetailCard>

        <RoleSummaryCard role={role} grantedCount={selectedRights.length} />
      </div>
    </div>
  );
}
