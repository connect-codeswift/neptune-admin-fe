"use client";

import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { TextButton } from "@/components/ui";
import { getModuleLabel } from "@/lib/ehs-modules";
import {
  type ClientAccountDetail,
  getClientSubscription,
} from "./client-accounts.mock";
import { DetailCard } from "./DetailCard";

function InfoField({
  label,
  children,
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-darkest/12 pb-2">
      <p className="text7 tracking-[0.5px] text-[#8892a3] uppercase">
        {label}
      </p>
      <div className="text5 font-semibold text-darkest">{children}</div>
    </div>
  );
}

function ModulePill({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[20px] border border-blue-normal/18 bg-blue-normal/12 px-3 py-1.5 text7 text-blue-normal">
      <span className="size-1.5 rounded-full bg-blue-normal" aria-hidden />
      {label}
    </span>
  );
}

function ContractRow({
  label,
  value,
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-darkest/12 pb-2">
      <p className="text6 text-[#8892a3]">{label}</p>
      <p className="text5 font-semibold text-darkest">{value}</p>
    </div>
  );
}

export function ClientOverviewTab({
  client,
}: Readonly<{ client: ClientAccountDetail }>) {
  const websiteHref = client.website.startsWith("http")
    ? client.website
    : `https://${client.website}`;
  const subscription = getClientSubscription(client.id);
  const yearlyValue = subscription
    ? `$${subscription.yearlyTotal.toLocaleString()}/yr`
    : "No subscription";

  return (
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        <DetailCard title="Company Information">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <InfoField label="Legal Name">{client.legalName}</InfoField>
            <InfoField label="Industry">{client.industry}</InfoField>
            <InfoField label="Client ID">{client.code}</InfoField>
            <InfoField label="Contract Start">{client.contractStart}</InfoField>
            <InfoField label="Company Website">
              <a
                href={websiteHref}
                target="_blank"
                rel="noreferrer"
                className="text-blue-normal hover:text-blue-deep"
              >
                {client.website}
              </a>
            </InfoField>
            <InfoField label="Number of Employees">
              {client.employeeCount}
            </InfoField>
            <InfoField label="Number of Sites">
              {client.siteCount} sites
            </InfoField>
            <InfoField label="Compliance Zone">
              {client.complianceZone}
            </InfoField>
          </div>
        </DetailCard>

        <DetailCard title="Licensed Modules">
          {subscription && subscription.modules.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {subscription.modules.map((moduleId) => (
                <ModulePill key={moduleId} label={getModuleLabel(moduleId)} />
              ))}
            </div>
          ) : (
            <p className="text5 text-gray">
              No modules licensed — this client has no active subscription yet.
            </p>
          )}
        </DetailCard>
      </div>

      <div className="flex flex-col gap-5">
        <DetailCard
          title="Primary Contact"
          action={
            <div
              className="flex size-8 items-center justify-center rounded-full bg-blue-normal text8 text-white"
              aria-hidden
            >
              {client.primaryContact.initials}
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="text4 text-darkest">
                {client.primaryContact.name}
              </p>
              <p className="mt-1 text6 text-[#8892a3]">
                {client.primaryContact.title}
              </p>
            </div>
            <div className="flex flex-col gap-2 border-t border-darkest/12 pt-3">
              <div className="flex items-center gap-2 text6 text-darkest/50">
                <Icon
                  icon="lucide:mail"
                  width={14}
                  height={14}
                  className="shrink-0"
                  aria-hidden
                />
                <span className="truncate">{client.primaryContact.email}</span>
              </div>
              <div className="flex items-center gap-2 text6 text-darkest/50">
                <Icon
                  icon="lucide:phone"
                  width={14}
                  height={14}
                  className="shrink-0"
                  aria-hidden
                />
                <span>{client.primaryContact.phone}</span>
              </div>
            </div>
          </div>
        </DetailCard>

        <DetailCard title="Contract Details">
          <div className="flex flex-col gap-3">
            <ContractRow label="Plan Type" value={client.contract.planType} />
            <ContractRow
              label="Contract Period"
              value={client.contract.period}
            />
            <ContractRow
              label="License Seats"
              value={client.contract.licenseSeats}
            />
            <ContractRow
              label="Assigned CSM"
              value={client.contract.assignedCsm}
            />
            <ContractRow label="Yearly Contract Value" value={yearlyValue} />
          </div>
        </DetailCard>

        <DetailCard title="Employee Data">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Icon
                  icon="lucide:file-text"
                  width={16}
                  height={16}
                  className="shrink-0 text-darkest"
                  aria-hidden
                />
                <p className="truncate text5 font-semibold text-darkest">
                  {client.employeeData.fileName}
                </p>
              </div>
              <span className="shrink-0 rounded-[20px] bg-green/12 px-2 py-0.5 text7 text-green">
                {client.employeeData.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-darkest/12 pt-3">
              <p className="text7 text-[#8892a3]">
                Last Updated: {client.employeeData.lastUpdated}
              </p>
              <TextButton
                type="button"
                size="sm"
                underline="always"
                onClick={() =>
                  toast.message("Employee data re-upload is not wired yet.")
                }
              >
                Re-upload
              </TextButton>
            </div>
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
