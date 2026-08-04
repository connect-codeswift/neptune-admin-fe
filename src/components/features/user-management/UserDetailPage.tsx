"use client";

import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { DetailCard } from "@/components/features/onboarding/DetailCard";
import { PageHeader } from "@/components/layouts";
import { Button, TextButton } from "@/components/ui";
import { getDummyUser, getUserDetailProfile } from "@/lib/dummy-users";
import { useUserManagementPaths } from "./useUserManagementPaths";

const ACTIVITY_TONE_CLASS = {
  green: "bg-green",
  red: "bg-red",
  blue: "bg-blue-normal",
  gray: "bg-[#8892a3]",
} as const;

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

function PermissionPill({
  label,
  active,
}: Readonly<{ label: string; active: boolean }>) {
  if (!active) {
    return (
      <span className="inline-flex items-center rounded-md bg-darkest/5 px-2.5 py-1 text7 text-[#8892a3]">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-blue-normal/12 px-2.5 py-1 text7 text-blue-normal">
      <Icon icon="lucide:check" width={12} height={12} aria-hidden />
      {label}
    </span>
  );
}

export function UserDetailPage({ userId }: Readonly<{ userId: string }>) {
  const { adminHref, basePath } = useUserManagementPaths();
  const user = getDummyUser(userId) ?? getDummyUser("1")!;
  const profile = getUserDetailProfile(user.id);
  const editHref = `${basePath}/${user.id}/edit`;

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title={user.name}
        description={`${user.role} · ${user.department} · ${user.site}`}
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "User Management", href: basePath },
          { label: user.name },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:pause"
              onClick={() => toast.success(`${user.name} suspended.`)}
            >
              Suspend
            </Button>
            <Button size="sm" leftIcon="lucide:pencil" href={editHref}>
              Edit User
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-6">
          <section className="rounded-[20px] border border-white bg-white/62 p-5.5 shadow-lg backdrop-blur-[10px]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blue-normal text2 text-white"
                aria-hidden
              >
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text3 text-darkest">{user.name}</p>
                <p className="mt-1 text5 text-gray">{user.email}</p>
                <div className="mt-4 grid grid-cols-1 gap-0 sm:grid-cols-2">
                  <ProfileField label="Role" value={user.role} />
                  <ProfileField label="Department" value={user.department} />
                  <ProfileField label="Primary Site" value={user.site} />
                  <ProfileField label="Last Login" value={user.lastLogin} />
                </div>
              </div>
            </div>
          </section>

          <DetailCard title="Activity Statistics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  value: profile.activityStats.incidentsFiled,
                  label: "Incidents filed",
                },
                {
                  value: profile.activityStats.actionsAssigned,
                  label: "Actions assigned",
                },
                {
                  value: profile.activityStats.docsApproved,
                  label: "Docs approved",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-consent-bg px-4 py-5 text-center"
                >
                  <p className="text2 text-darkest">{stat.value}</p>
                  <p className="mt-1 text6 text-gray">{stat.label}</p>
                </div>
              ))}
            </div>
          </DetailCard>

          <DetailCard
            title="Activity Log"
            action={
              <TextButton href="#" size="sm" underline="none">
                View audit log
              </TextButton>
            }
          >
            <ul className="flex flex-col gap-4">
              {profile.activityLog.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${ACTIVITY_TONE_CLASS[item.tone]}`}
                      aria-hidden
                    />
                    <p className="text5 text-darkest">{item.label}</p>
                  </div>
                  <time className="shrink-0 text6 text-[#8892a3]">
                    {item.time}
                  </time>
                </li>
              ))}
            </ul>
          </DetailCard>
        </div>

        <DetailCard
          title="Permission Matrix"
          description={`Permissions inherited from role: ${user.role}`}
        >
          <div className="flex flex-col gap-5">
            {profile.permissionGroups.map((group) => (
              <div key={group.label}>
                <p className="text8 tracking-[0.66px] text-[#8892a3] uppercase">
                  {group.label}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.permissions.map((permission) => (
                    <PermissionPill
                      key={`${group.label}-${permission.label}`}
                      label={permission.label}
                      active={permission.active}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
