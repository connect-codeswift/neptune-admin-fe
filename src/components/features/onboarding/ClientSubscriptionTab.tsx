"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { NumberInput } from "@/components/inputs";
import { SubscriptionBreakdownPanel } from "@/components/features/subscriptions/SubscriptionBreakdownPanel";
import {
  Button,
  Table,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import { getSubscriptionStatusLabel } from "@/lib/dummy-subscriptions";
import {
  type ClientAccountDetail,
  type ClientTrialHistoryItem,
  getClientSubscription,
} from "./client-accounts.mock";
import { DetailCard } from "./DetailCard";

function DetailMetric({
  label,
  value,
  accent = false,
}: Readonly<{ label: string; value: string; accent?: boolean }>) {
  return (
    <div className="min-w-0">
      <p className="text7 tracking-[0.5px] text-[#8892a3] uppercase">
        {label}
      </p>
      <p
        className={`mt-1 text5 font-semibold ${
          accent ? "text-blue-normal" : "text-darkest"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function HistoryStatusBadge({
  status,
}: Readonly<{ status: ClientTrialHistoryItem["status"] }>) {
  let className = "bg-blue-normal/12 text-blue-normal";
  let label = "Active";
  if (status === "completed") {
    className = "bg-green/12 text-green";
    label = "Completed";
  } else if (status === "expired") {
    className = "bg-red/12 text-red";
    label = "Expired";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text7 ${className}`}
    >
      {label}
    </span>
  );
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const HISTORY_COLUMNS: TableColumn<ClientTrialHistoryItem>[] = [
  {
    id: "action",
    header: "Action",
    cell: (row) => (
      <span className="text5 font-semibold text-darkest">{row.action}</span>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: (row) => <TableTextCell>{row.date}</TableTextCell>,
  },
  {
    id: "duration",
    header: "Duration",
    cell: (row) => <TableTextCell>{row.duration}</TableTextCell>,
  },
  {
    id: "planType",
    header: "Plan Type",
    cell: (row) => <TableTextCell>{row.planType}</TableTextCell>,
  },
  {
    id: "initiatedBy",
    header: "Initiated By",
    cell: (row) => <TableTextCell>{row.initiatedBy}</TableTextCell>,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <HistoryStatusBadge status={row.status} />,
  },
];

export function ClientSubscriptionTab({
  client,
}: Readonly<{ client: ClientAccountDetail }>) {
  const { subscription: trial } = client;
  const contract = getClientSubscription(client.id);
  const [additionalDays, setAdditionalDays] = useState("15");

  const parsedAdditional = Number.parseInt(additionalDays, 10);
  const projectedEnd = Number.isFinite(parsedAdditional)
    ? addDaysToIsoDate(trial.trialEndDate, parsedAdditional)
    : trial.trialEndDate;

  if (contract === null) {
    return (
      <div className="flex flex-col gap-5">
        <DetailCard
          title="Subscription"
          description={`${client.name} is onboarded but has no yearly contract yet, so no modules are licensed.`}
        >
          <Link
            href="/super/subscriptions"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-normal px-4 py-2.5 text5 font-semibold text-white transition-colors hover:bg-blue-deep"
          >
            <Icon icon="lucide:plus" width={16} height={16} aria-hidden />
            Create Subscription
          </Link>
        </DetailCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <DetailCard
        title="Subscription Details"
        action={
          <span className="shrink-0 rounded-full bg-blue-normal/12 px-2.5 py-1 text7 text-blue-normal">
            {getSubscriptionStatusLabel(contract.status)}
          </span>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <DetailMetric label="Plan Type" value="Custom Enterprise" />
          <DetailMetric
            label="Licensed Users"
            value={String(contract.licensedUsers)}
          />
          <DetailMetric label="Sites" value={String(contract.siteCount)} />
          <DetailMetric
            label="Licensed Modules"
            value={String(contract.modules.length)}
          />
          <DetailMetric
            label="Yearly Contract"
            value={`$${contract.yearlyTotal.toLocaleString()}/yr`}
            accent
          />
          <DetailMetric label="Billing Contact" value={trial.billingContact} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-darkest/8 pt-4">
          <p className="text6 text-gray">
            Term {contract.termStart} to {contract.termEnd}
          </p>
          <Link
            href="/super/subscriptions"
            className="text6 font-semibold text-blue-normal hover:underline"
          >
            Manage Subscription
          </Link>
        </div>
      </DetailCard>

      <SubscriptionBreakdownPanel lineItems={contract.lineItems} />

      <DetailCard
        title="Extend Trial"
        description="Extend the current active trial period"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
            <NumberInput
              label="Additional Days"
              min={1}
              value={additionalDays}
              onChange={(event) => setAdditionalDays(event.target.value)}
            />
            <div className="pb-1 text7 text-[#8892a3]">
              <p>
                Current End:{" "}
                <span className="font-semibold text-darkest">
                  {trial.trialEndDate}
                </span>
              </p>
              <p className="mt-1">
                Projected End:{" "}
                <span className="font-semibold text-blue-normal">
                  {projectedEnd}
                </span>
              </p>
            </div>
          </div>
          <Button
            type="button"
            fullWidth
            onClick={() =>
              toast.success(
                `Trial extension requested (+${additionalDays} days).`,
              )
            }
          >
            Extend Trial
          </Button>
        </div>
      </DetailCard>

      <DetailCard title="Trial History">
        <Table
          columns={HISTORY_COLUMNS}
          data={trial.history}
          getRowId={(row) => row.id}
          emptyMessage="No trial history yet."
          className="border-darkest/8 bg-white shadow-lg backdrop-blur-none"
        />
      </DetailCard>
    </div>
  );
}
