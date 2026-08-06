"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PageHeader, PlaceholderPage } from "@/components/layouts";
import { Button, ConfirmDialog, TableStatusBadge } from "@/components/ui";
import {
  useSuperAdminUserDetail,
  useUpdateSuperAdminUserStatus,
} from "@/hooks/useSuperAdminUserMutations";
import {
  formatRoleName,
  getUserInitials,
  mapApiStatusToTableStatus,
} from "@/lib/mappers/users.mapper";
import { useUserManagementPaths } from "./useUserManagementPaths";

function ProfileField({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex flex-col gap-1 border-b border-darkest/8 py-3 last:border-b-0">
      <span className="text8 tracking-[0.66px] text-[#8892a3] uppercase">
        {label}
      </span>
      <span className="text5 text-darkest">{value}</span>
    </div>
  );
}

export function UserDetailPage({ userId }: Readonly<{ userId: string }>) {
  const router = useRouter();
  const { adminHref, basePath } = useUserManagementPaths();
  const { data: user, isLoading, isError, error } = useSuperAdminUserDetail(userId);
  const statusMutation = useUpdateSuperAdminUserStatus(userId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  if (isLoading) {
    return (
      <PlaceholderPage
        title="Loading User"
        description="Fetching user details from the API…"
      />
    );
  }

  if (isError || !user) {
    return (
      <PlaceholderPage
        title="User Not Found"
        description={
          error instanceof Error ? error.message : "Could not load this user."
        }
      />
    );
  }

  const displayName = user.fullName?.trim() || user.email;
  const editHref = `${basePath}/${user.id}/edit`;
  const status = mapApiStatusToTableStatus(user.status, user.isDrop);
  const isSuspended = status === "suspended";

  const handleDeactivate = async () => {
    try {
      await statusMutation.mutateAsync(true);
      toast.success(`${displayName} deactivated.`);
      setConfirmOpen(false);
      router.refresh();
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Failed to deactivate user.",
      );
    }
  };

  const handleReactivate = async () => {
    try {
      await statusMutation.mutateAsync(false);
      toast.success(`${displayName} reactivated.`);
      setReactivateOpen(false);
      router.refresh();
    } catch (statusError) {
      toast.error(
        statusError instanceof Error
          ? statusError.message
          : "Failed to reactivate user.",
      );
    }
  };

  return (
    <>
      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate User"
        description={
          <>
            Deactivate <strong>{displayName}</strong>? They will lose access
            immediately but remain listed as suspended.
          </>
        }
        cancelLabel="Cancel"
        confirmLabel="Deactivate"
        confirmVariant="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void handleDeactivate()}
      />

      <ConfirmDialog
        open={reactivateOpen}
        title="Reactivate User"
        description={
          <>
            Reactivate <strong>{displayName}</strong> and restore their access?
          </>
        }
        cancelLabel="Cancel"
        confirmLabel="Reactivate"
        onCancel={() => setReactivateOpen(false)}
        onConfirm={() => void handleReactivate()}
      />

      <div className="flex flex-col gap-6 pb-4">
        <PageHeader
          title={displayName}
          description={`${formatRoleName(user.roleName)} · ${user.siteName ?? "—"}`}
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
            { label: displayName },
          ]}
          actions={
            <>
              {isSuspended ? (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon="lucide:user-check"
                  onClick={() => setReactivateOpen(true)}
                  disabled={statusMutation.isPending}
                >
                  Reactivate
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon="lucide:user-x"
                  onClick={() => setConfirmOpen(true)}
                  disabled={statusMutation.isPending}
                >
                  Deactivate
                </Button>
              )}
              <Button size="sm" leftIcon="lucide:pencil" href={editHref}>
                Edit User
              </Button>
            </>
          }
        />

        <section className="rounded-[20px] border border-white bg-white/62 p-5.5 shadow-lg backdrop-blur-[10px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-normal text2 text-white"
              aria-hidden
            >
              {getUserInitials(displayName, user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text3 text-darkest">{displayName}</p>
                <TableStatusBadge status={status} />
              </div>
              <p className="mt-1 text5 text-gray">{user.email}</p>
              <div className="mt-4 grid grid-cols-1 gap-0 sm:grid-cols-2">
                <ProfileField label="Role" value={formatRoleName(user.roleName)} />
                <ProfileField label="Site" value={user.siteName ?? "—"} />
                <ProfileField label="Gender" value={user.gender?.trim() || "—"} />
                <ProfileField label="Location" value={user.siteLocation ?? "—"} />
                <ProfileField
                  label="MFA"
                  value={user.mfaEnabled ? "Enabled" : "Disabled"}
                />
                <ProfileField
                  label="Invited"
                  value={user.isInvited ? "Yes" : "No"}
                />
                <ProfileField
                  label="Created"
                  value={
                    user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"
                  }
                />
              </div>
            </div>
          </div>
        </section>

        <DetailCard title="Contact">
          <ProfileField label="Phone" value={user.contactNo?.trim() || "—"} />
        </DetailCard>
      </div>
    </>
  );
}
