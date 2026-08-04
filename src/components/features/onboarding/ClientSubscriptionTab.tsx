"use client";

import { useState } from "react";
import { toast } from "sonner";
import { NumberInput, SelectInput } from "@/components/inputs";
import {
  Button,
  Table,
  TableTextCell,
  type TableColumn,
} from "@/components/ui";
import type {
  ClientAccountDetail,
  ClientTrialHistoryItem,
} from "./client-accounts.mock";
import { DetailCard } from "./DetailCard";

const PLAN_OPTIONS = [
  { value: "enterprise", label: "Enterprise" },
  { value: "standard", label: "Standard" },
  { value: "starter", label: "Starter" },
];

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
  const { subscription } = client;
  const [trialDays, setTrialDays] = useState("30");
  const [planType, setPlanType] = useState("enterprise");
  const [additionalDays, setAdditionalDays] = useState("15");

  const parsedAdditional = Number.parseInt(additionalDays, 10);
  const projectedEnd = Number.isFinite(parsedAdditional)
    ? addDaysToIsoDate(subscription.trialEndDate, parsedAdditional)
    : subscription.trialEndDate;

  return (
    <div className="flex flex-col gap-5">
      <DetailCard
        title="Subscription Details"
        action={
          <span className="rounded-full bg-blue-normal/12 px-2.5 py-1 text7 text-blue-normal">
            {subscription.statusLabel}
          </span>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DetailMetric label="Plan Type" value={subscription.planType} />
          <DetailMetric
            label="Trial Start Date"
            value={subscription.trialStartDate}
          />
          <DetailMetric
            label="Trial End Date"
            value={subscription.trialEndDate}
          />
          <DetailMetric
            label="Days Remaining"
            value={`${subscription.daysRemaining} days`}
            accent
          />
          <DetailMetric
            label="Billing Contact"
            value={subscription.billingContact}
          />
        </div>
      </DetailCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <DetailCard
          title="Start Trial"
          description="Initiate a new trial period for this client"
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <NumberInput
                label="Trial Duration (Days)"
                min={1}
                value={trialDays}
                onChange={(event) => setTrialDays(event.target.value)}
              />
              <SelectInput
                label="Plan Type"
                options={PLAN_OPTIONS}
                value={planType}
                onChange={setPlanType}
              />
            </div>
            <Button
              type="button"
              fullWidth
              onClick={() =>
                toast.success(
                  `Trial start requested (${trialDays} days, ${planType}).`,
                )
              }
            >
              Start Trial
            </Button>
          </div>
        </DetailCard>

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
                    {subscription.trialEndDate}
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
      </div>

      <DetailCard title="Trial History">
        <Table
          columns={HISTORY_COLUMNS}
          data={subscription.history}
          getRowId={(row) => row.id}
          emptyMessage="No trial history yet."
          className="border-darkest/8 bg-white shadow-lg backdrop-blur-none"
        />
      </DetailCard>
    </div>
  );
}
