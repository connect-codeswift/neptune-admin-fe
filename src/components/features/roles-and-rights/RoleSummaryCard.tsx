"use client";

import { DetailCard } from "@/components/features/onboarding/DetailCard";
import type { RoleViewModel } from "@/lib/mappers/roles.mapper";

function SummaryRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ehs-border-ink/8 py-3 text4 last:border-b-0">
      <span className="text-gray">{label}</span>
      <span className="text-right font-semibold text-darkest tabular-nums">
        {value}
      </span>
    </div>
  );
}

/**
 * The at-a-glance column beside the rights matrix, shared by the role detail
 * and edit screens so the two read as one place. `grantedCount` is a prop
 * rather than `role.permissionIds.length` because the edit screen counts the
 * in-progress selection, not the saved one.
 */
export function RoleSummaryCard({
  role,
  grantedCount,
}: Readonly<{ role: RoleViewModel; grantedCount: number }>) {
  return (
    <DetailCard title="Role Summary">
      <SummaryRow label="Users assigned" value={String(role.userCount)} />
      <SummaryRow label="Type" value={role.isSystem ? "System" : "Custom"} />
      <SummaryRow label="Rights" value={`${grantedCount} granted`} />
      {/* Permission claims are stamped into the JWT at login, so an edit here
          reaches each holder at their next sign-in, not mid-session. */}
      <p className="mt-3 text8 leading-relaxed text-ehs-muted-text">
        Changes apply to each holder at their next sign-in.
      </p>
    </DetailCard>
  );
}
