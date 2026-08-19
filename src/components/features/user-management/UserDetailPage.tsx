"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button, ConfirmDialog, TableStatusBadge } from "@/components/ui";
import { GLASS_SURFACE, GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  useSuperAdminUserDetail,
  useUpdateSuperAdminUserStatus,
} from "@/hooks/useSuperAdminUserMutations";
import {
  formatRoleName,
  getUserInitials,
  mapApiStatusToTableStatus,
  readUserSiteNames,
} from "@/lib/mappers/users.mapper";
import { useUserManagementPaths } from "./useUserManagementPaths";

function ProfileField({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-ehs-border-ink/8 py-3">
      <span className="text8 tracking-[0.66px] text-ehs-muted-text uppercase">
        {label}
      </span>
      {/* Site lists and job titles are the two that run long; truncating with
          the full string in `title` keeps the two-column grid aligned. */}
      <span className="truncate text4 text-darkest" title={value}>
        {value}
      </span>
    </div>
  );
}

/**
 * Placeholder shaped like the profile pane below it — the avatar disc, the name
 * and status line, and the two-column field grid — so the page does not reflow
 * when the request lands.
 */
function UserDetailSkeleton() {
  const fields = Array.from({ length: 8 }, (_, index) => `field-${String(index)}`);

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading user details…"
      className={`${GLASS_SURFACE} p-5.5`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Skeleton className="size-16 shrink-0 rounded-full bg-ehs-skeleton-strong" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-6 w-52 rounded-md bg-ehs-skeleton-strong" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3.5 w-64 rounded-md" />
          <div className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {fields.map((key) => (
              <div
                key={key}
                className="flex flex-col gap-1.5 border-b border-ehs-border-ink/8 py-3"
              >
                <Skeleton className="h-2.5 w-20 rounded-md" />
                <Skeleton className="h-3.5 w-36 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserDetailPage({ userId }: Readonly<{ userId: string }>) {
  const router = useRouter();
  const { adminHref, basePath } = useUserManagementPaths();
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useSuperAdminUserDetail(userId);
  const statusMutation = useUpdateSuperAdminUserStatus(userId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="User"
          description="Loading user details…"
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
          ]}
        />
        <UserDetailSkeleton />
        <FeatureLoadingCard rows={1} label="Loading contact details…" />
      </div>
    );
  }

  // A failed request and a user that simply is not there are different
  // situations and read differently: one offers a retry, the other explains
  // that the record is gone.
  if (isError) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="User"
          description="This user could not be loaded."
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
          ]}
        />
        <FeatureErrorCard
          title="Couldn’t load this user"
          message={
            error instanceof Error ? error.message : "Could not load this user."
          }
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title="User"
          description="This user could not be found."
          breadcrumbs={[
            { label: "Admin", href: adminHref },
            { label: "User Management", href: basePath },
          ]}
        />
        <FeatureEmptyState
          icon="mdi:account-question-outline"
          title="User not found"
          description="The account may have been removed, or the link that brought you here is out of date. Retrying will not bring it back."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon="mdi:arrow-left"
              href={basePath}
            >
              Back to User Management
            </Button>
          }
        />
      </div>
    );
  }

  const displayName = user.fullName?.trim() || user.email;
  const siteNames = readUserSiteNames(user);
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
        loading={statusMutation.isPending}
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
        confirmVariant="primary"
        loading={statusMutation.isPending}
        onCancel={() => setReactivateOpen(false)}
        onConfirm={() => void handleReactivate()}
      />

      <div className="flex min-w-0 flex-col gap-6 pb-4">
        <PageHeader
          title={displayName}
          description={`${formatRoleName(user.roleName)} · ${siteNames.join(", ") || "—"}`}
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

        <GlassCard className="p-5.5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-normal text2 text-ehs-on-accent"
              aria-hidden
            >
              {getUserInitials(displayName, user.email)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                {/* h2 under the PageHeader's h1: the profile pane is the page's
                    first section, and the level must not be skipped. */}
                <h2 className="min-w-0 truncate text3 text-darkest">
                  {displayName}
                </h2>
                <TableStatusBadge status={status} />
              </div>
              <p className="mt-1 truncate text4 text-gray" title={user.email}>
                {user.email}
              </p>
              <div className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <ProfileField
                  label="Job Title"
                  value={user.jobTitle?.trim() || "—"}
                />
                <ProfileField label="Role" value={formatRoleName(user.roleName)} />
                <ProfileField
                  label={siteNames.length > 1 ? "Sites" : "Site"}
                  value={siteNames.join(", ") || "—"}
                />
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
        </GlassCard>

        {/* A "Contact" card holding one field read as an offcut. Email is the
            channel invitations and resets go to, so it belongs beside the
            phone number rather than only in the header strip above. */}
        <DetailCard title="Contact">
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            <ProfileField label="Email" value={user.email} />
            <ProfileField label="Phone" value={user.contactNo?.trim() || "—"} />
          </div>
        </DetailCard>
      </div>
    </>
  );
}
