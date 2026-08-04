"use client";

import { IconButton } from "@/components/ui";
import {
  VISIBLE_RIGHTS_COUNT,
  type DummyRole,
} from "@/lib/dummy-roles";

type RoleCardProps = Readonly<{
  role: DummyRole;
  basePath: string;
}>;

function RightTag({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center rounded-md bg-darkest/6 px-2 py-0.5 text6 text-darkest">
      {label}
    </span>
  );
}

export function RoleCard({ role, basePath }: RoleCardProps) {
  const visibleRights = role.rights.slice(0, VISIBLE_RIGHTS_COUNT);
  const hiddenCount = role.rights.length - visibleRights.length;

  return (
    <article className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-xl backdrop-blur-[10px]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text3 text-darkest">{role.name}</h2>
            {role.isSystem ? (
              <span className="inline-flex items-center rounded-md bg-blue-normal/12 px-2 py-0.5 text7 font-semibold tracking-[0.5px] text-blue-normal uppercase">
                System
              </span>
            ) : null}
          </div>

          <p className="mt-1 text5 text-gray">{role.description}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {visibleRights.map((right) => (
              <RightTag key={right} label={right} />
            ))}
            {hiddenCount > 0 ? (
              <span className="text6 font-semibold text-blue-normal">
                +{hiddenCount} more
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start lg:pt-1">
          <p className="text7 font-semibold tracking-[0.5px] text-[#8892a3] uppercase">
            {role.userCount} {role.userCount === 1 ? "User" : "Users"}
          </p>

          <div className="flex items-center gap-1.5">
            <IconButton
              icon="lucide:eye"
              label={`View ${role.name}`}
              size="sm"
              href={`${basePath}/${role.id}`}
            />
            {!role.isSystem ? (
              <IconButton
                icon="lucide:pencil"
                label={`Edit ${role.name}`}
                size="sm"
                href={`${basePath}/${role.id}/edit`}
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
