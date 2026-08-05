"use client";

import { useMemo, useState } from "react";
import {
  DateInput,
  NumberInput,
  SelectInput,
  TextAreaInput,
  ToggleBadges,
} from "@/components/inputs";
import { Modal } from "@/components/ui";
import {
  addYearMinusDay,
  applyOverride,
  buildLineItems,
  clearOverride,
  getOrganizationOptions,
  getSiteCountForOrganization,
  reseedLineItems,
  sumLineItems,
  SUBSCRIPTION_STATUS_OPTIONS,
  type Subscription,
  type SubscriptionLineItemKind,
  type SubscriptionStatus,
} from "@/lib/dummy-subscriptions";
import { DUMMY_ORGANIZATIONS } from "@/lib/dummy-organizations";
import { getModuleOptions } from "@/lib/ehs-modules";
import type { PricingRates } from "@/lib/pricing-rates";
import { SubscriptionBreakdownPanel } from "./SubscriptionBreakdownPanel";

type SubscriptionModalProps = Readonly<{
  open: boolean;
  subscription: Subscription | null;
  rates: PricingRates;
  subscribedOrganizationIds: string[];
  loading?: boolean;
  onClose: () => void;
  onSave: (subscription: Subscription) => void;
}>;

function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createEmptyDraft(
  rates: PricingRates,
  availableOrgId: string | undefined,
): Subscription {
  const orgId = availableOrgId ?? DUMMY_ORGANIZATIONS[0]?.id ?? "1";
  const org = DUMMY_ORGANIZATIONS.find((entry) => entry.id === orgId);
  const siteCount = org?.siteCount ?? 1;
  const modules = ["incident", "hazard"];
  const licensedUsers = 25;
  const lineItems = buildLineItems(rates, {
    licensedUsers,
    siteCount,
    modules,
  });
  const termStart = todayIso();

  return {
    id: `sub-${crypto.randomUUID()}`,
    organizationId: orgId,
    organizationName: org?.name ?? "Organization",
    licensedUsers,
    siteCount,
    modules,
    lineItems,
    yearlyTotal: sumLineItems(lineItems),
    termStart,
    termEnd: addYearMinusDay(termStart),
    status: "draft",
    notes: "",
  };
}

export function SubscriptionModal({
  open,
  subscription,
  rates,
  subscribedOrganizationIds,
  loading = false,
  onClose,
  onSave,
}: SubscriptionModalProps) {
  const isEditing = subscription !== null;

  const organizationOptions = useMemo(() => {
    return getOrganizationOptions().filter((option) =>
      isEditing
        ? option.value === subscription.organizationId
        : !subscribedOrganizationIds.includes(option.value),
    );
  }, [isEditing, subscribedOrganizationIds, subscription]);

  const [draft, setDraft] = useState<Subscription>(
    () => subscription ?? createEmptyDraft(rates, organizationOptions[0]?.value),
  );

  const updateQuantities = (
    patch: Partial<
      Pick<Subscription, "licensedUsers" | "siteCount" | "modules">
    >,
  ) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      const lineItems = reseedLineItems(
        rates,
        {
          licensedUsers: next.licensedUsers,
          siteCount: next.siteCount,
          modules: next.modules,
        },
        current.lineItems,
      );
      return { ...next, lineItems, yearlyTotal: sumLineItems(lineItems) };
    });
  };

  const handleOrganizationChange = (organizationId: string) => {
    const org = DUMMY_ORGANIZATIONS.find(
      (entry) => entry.id === organizationId,
    );
    const siteCount = getSiteCountForOrganization(organizationId);

    setDraft((current) => {
      const lineItems = reseedLineItems(
        rates,
        {
          licensedUsers: current.licensedUsers,
          siteCount,
          modules: current.modules,
        },
        current.lineItems,
      );

      return {
        ...current,
        organizationId,
        organizationName: org?.name ?? `Organization ${organizationId}`,
        siteCount,
        lineItems,
        yearlyTotal: sumLineItems(lineItems),
      };
    });
  };

  const handleOverride = (
    kind: SubscriptionLineItemKind,
    key: string,
    unitPrice: number,
  ) => {
    setDraft((current) => {
      const lineItems = applyOverride(current.lineItems, kind, key, unitPrice);
      return { ...current, lineItems, yearlyTotal: sumLineItems(lineItems) };
    });
  };

  const handleClearOverride = (
    kind: SubscriptionLineItemKind,
    key: string,
  ) => {
    setDraft((current) => {
      const lineItems = clearOverride(rates, current.lineItems, kind, key);
      return { ...current, lineItems, yearlyTotal: sumLineItems(lineItems) };
    });
  };

  const handleTermStartChange = (termStart: string) => {
    setDraft((current) => ({
      ...current,
      termStart,
      termEnd: addYearMinusDay(termStart),
    }));
  };

  if (!open) return null;

  const canSave =
    draft.modules.length > 0 &&
    draft.organizationId !== "" &&
    draft.termStart !== "" &&
    draft.termEnd !== "";

  let modalTitle = "Create Subscription";
  if (isEditing) {
    modalTitle = `Edit ${draft.organizationName} Subscription`;
  }

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={onClose}
      onPrimary={() => onSave({ ...draft, notes: draft.notes.trim() })}
      primaryLabel={isEditing ? "Save Subscription" : "Create Subscription"}
      secondaryLabel="Cancel"
      onSecondary={onClose}
      loading={loading}
      disabled={!canSave}
      size="xl"
      closeOnBackdrop={!loading}
    >
      <div className="flex flex-col gap-5">
        {organizationOptions.length === 0 && !isEditing ? (
          <p className="rounded-xl border border-yellow/40 bg-yellow/12 px-4 py-3 text5 text-darkest">
            Every client already has a subscription. Onboard a new client first,
            or edit an existing subscription.
          </p>
        ) : null}

        <SelectInput
          label="Client"
          options={organizationOptions}
          value={draft.organizationId}
          onChange={handleOrganizationChange}
          disabled={isEditing}
          placeholder="Select an onboarded client"
          helperText={
            isEditing
              ? undefined
              : "Only onboarded clients without a subscription are listed."
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberInput
            label="Licensed Users"
            min={1}
            value={String(draft.licensedUsers)}
            onChange={(event) =>
              updateQuantities({
                licensedUsers: Number(event.target.value) || 1,
              })
            }
            helperText="Agreed seat count."
          />
          <NumberInput
            label="Number of Sites"
            min={1}
            value={String(draft.siteCount)}
            onChange={(event) =>
              updateQuantities({ siteCount: Number(event.target.value) || 1 })
            }
            helperText="Defaults to the client's onboarded sites."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DateInput
            label="Term Start"
            value={draft.termStart}
            onChange={handleTermStartChange}
          />
          <DateInput
            label="Term End"
            value={draft.termEnd}
            onChange={(termEnd) =>
              setDraft((current) => ({ ...current, termEnd }))
            }
            helperText="Auto-set to one year from the start date."
          />
        </div>

        <ToggleBadges
          label="Licensed Modules"
          variant="card"
          countPlacement="footer"
          countNoun="modules selected"
          options={getModuleOptions()}
          value={draft.modules}
          onChange={(modules) => updateQuantities({ modules })}
          helperText="Each module adds its own annual price. The client can only access what is licensed here."
        />

        <SubscriptionBreakdownPanel
          lineItems={draft.lineItems}
          editable
          onOverride={handleOverride}
          onClearOverride={handleClearOverride}
        />

        <SelectInput
          label="Status"
          options={SUBSCRIPTION_STATUS_OPTIONS}
          value={draft.status}
          onChange={(status) =>
            setDraft((current) => ({
              ...current,
              status: status as SubscriptionStatus,
            }))
          }
        />

        <TextAreaInput
          label="Internal Notes"
          rows={3}
          placeholder="Optional notes about this contract or negotiation…"
          value={draft.notes}
          onChange={(event) =>
            setDraft((current) => ({ ...current, notes: event.target.value }))
          }
        />
      </div>
    </Modal>
  );
}
