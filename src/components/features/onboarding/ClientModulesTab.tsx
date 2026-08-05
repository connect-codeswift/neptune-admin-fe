"use client";

import Link from "next/link";
import { EHS_MODULES } from "@/lib/ehs-modules";
import {
  type ClientAccountDetail,
  getClientSubscription,
} from "./client-accounts.mock";
import { DetailCard } from "./DetailCard";

function ModuleCard({
  label,
  licensed,
}: Readonly<{ label: string; licensed: boolean }>) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${
        licensed
          ? "border-blue-normal/20 bg-blue-normal/8"
          : "border-darkest/10 bg-white"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`size-1.5 shrink-0 rounded-full ${
            licensed ? "bg-blue-normal" : "bg-darkest/25"
          }`}
          aria-hidden
        />
        <span
          className={`text5 ${licensed ? "text-darkest" : "text-darkest/45"}`}
        >
          {label}
        </span>
      </span>
    </div>
  );
}

export function ClientModulesTab({
  client,
}: Readonly<{ client: ClientAccountDetail }>) {
  const subscription = getClientSubscription(client.id);
  const licensedIds = new Set(subscription?.modules ?? []);

  const licensed = EHS_MODULES.filter((module) => licensedIds.has(module.id));
  const notLicensed = EHS_MODULES.filter(
    (module) => !licensedIds.has(module.id),
  );

  return (
    <DetailCard
      title="Licensed EHS Modules"
      description={`Modules are granted by ${client.name}'s subscription. Change the subscription to add or remove access.`}
      action={
        <Link
          href="/super/subscriptions"
          className="shrink-0 text6 font-semibold text-blue-normal hover:underline"
        >
          Manage Subscription
        </Link>
      }
    >
      {subscription === null ? (
        <div className="rounded-xl border border-yellow/40 bg-yellow/12 px-4 py-3.5">
          <p className="text5 text-darkest">
            No subscription yet — this client has no licensed modules.
          </p>
          <Link
            href="/super/subscriptions"
            className="mt-1 inline-flex text6 font-semibold text-blue-normal hover:underline"
          >
            Create a subscription
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <section>
            <p className="mb-3 text8 tracking-[0.5px] text-blue-normal uppercase">
              Licensed ({licensed.length})
            </p>
            {licensed.length === 0 ? (
              <p className="text5 text-gray">No licensed modules.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {licensed.map((module) => (
                  <ModuleCard
                    key={module.id}
                    label={module.label}
                    licensed
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <p className="mb-3 text8 tracking-[0.5px] text-[#8892a3] uppercase">
              Not Licensed ({notLicensed.length})
            </p>
            {notLicensed.length === 0 ? (
              <p className="text5 text-gray">Every module is licensed.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {notLicensed.map((module) => (
                  <ModuleCard
                    key={module.id}
                    label={module.label}
                    licensed={false}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </DetailCard>
  );
}
