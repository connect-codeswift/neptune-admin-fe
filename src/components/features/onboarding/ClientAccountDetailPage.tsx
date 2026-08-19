"use client";

import { useCallback, useState } from "react";
import {
  FeatureEmptyState,
  FeatureErrorCard,
  FeatureLoadingCard,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button, TabBar } from "@/components/ui";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useClientAccountDetail } from "@/hooks/useClientAccountDetail";
import { clearOrgSession } from "@/lib/auth-tokens";
import { parseActivatedModuleCodes } from "@/lib/ehs-modules";
import { ClientModulesTab } from "./ClientModulesTab";
import { ClientNotificationsTab } from "./ClientNotificationsTab";
import { ClientOverviewTab } from "./ClientOverviewTab";
import { ClientSitesTab } from "./ClientSitesTab";
import { ClientSubscriptionTab } from "./ClientSubscriptionTab";
import { ClientAccessWindowActions } from "./ClientAccessWindowPanel";
import {
  ClientVitalsBand,
  ClientVitalsBandSkeleton,
  type ClientVital,
} from "./ClientVitalsBand";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sites", label: "Sites" },
  { id: "modules", label: "Modules" },
  { id: "access", label: "Access & Limits" },
  { id: "notifications", label: "Notifications" },
] as const;

const SITES_TAB_INDEX = TABS.findIndex((tab) => tab.id === "sites");
const MODULES_TAB_INDEX = TABS.findIndex((tab) => tab.id === "modules");

function formatShortDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Sonar S3358: the cases are `if`s, not a ternary nested inside a ternary. */
function accessSummary(
  accessExpiresAt: string | null | undefined,
  daysRemaining: number | null | undefined,
): { label: string; lapsed: boolean; expired: boolean } {
  if (!accessExpiresAt) {
    return { label: "Permanent", lapsed: false, expired: false };
  }
  if (daysRemaining == null) {
    return { label: "Time-boxed", lapsed: false, expired: false };
  }
  if (daysRemaining < 0) {
    return { label: "Expired", lapsed: true, expired: true };
  }
  if (daysRemaining === 0) {
    return { label: "Final day", lapsed: true, expired: false };
  }
  return {
    label: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`,
    lapsed: daysRemaining <= 7,
    expired: false,
  };
}

/** "12 / 25" when a cap exists, "12 · no cap" when it does not. */
function formatUsage(
  used: number | undefined,
  max: number | null | undefined,
): string {
  const usedValue = used ?? 0;
  if (max == null) return `${usedValue} · no cap`;
  return `${usedValue} / ${max}`;
}

/**
 * Placeholder shaped like the loaded page — header band, vitals band with its
 * tab strip, then the two-column content split — instead of a lone card that
 * then jumps as the real layout arrives.
 */
function ClientAccountDetailSkeleton() {
  return (
    <div
      className="flex flex-col gap-3.5 pb-4"
      role="status"
      aria-busy="true"
      aria-label="Loading client account…"
    >
      <div className={`${GLASS_SURFACE} flex flex-col gap-3 px-6 py-5`}>
        <Skeleton className="bg-ehs-skeleton-strong h-7 w-64 rounded-md" />
        <Skeleton className="h-3.5 w-48 rounded-md" />
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      <ClientVitalsBandSkeleton tabCount={TABS.length} />

      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <FeatureLoadingCard rows={8} label="Loading client account…" />
        <FeatureLoadingCard rows={4} label="Loading account context…" />
      </div>
    </div>
  );
}

export function ClientAccountDetailPage({
  clientId,
}: Readonly<{ clientId: string }>) {
  const organizationId = Number(clientId);
  const {
    data: company,
    isLoading,
    isError,
    error,
    refetch,
  } = useClientAccountDetail(
    Number.isFinite(organizationId) ? organizationId : undefined,
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingSiteEditId, setPendingSiteEditId] = useState<number | null>(null);

  const activeTab = TABS[activeIndex] ?? TABS[0];

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  const handleEditSiteFromOverview = (siteId: number) => {
    setPendingSiteEditId(siteId);
    setActiveIndex(SITES_TAB_INDEX);
  };

  const handleInitialEditConsumed = useCallback(() => {
    setPendingSiteEditId(null);
  }, []);

  if (isLoading) {
    return <ClientAccountDetailSkeleton />;
  }

  // A request that failed and a company that is not there read differently:
  // one is worth retrying, the other never will be.
  if (isError) {
    return (
      <FeatureErrorCard
        title="Couldn’t load this client account"
        message={
          error instanceof Error
            ? error.message
            : "The client account did not load. Check your connection and try again."
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!company) {
    return (
      <FeatureEmptyState
        icon="mdi:domain-off"
        title="Client account not found"
        description="The company may have been removed, or the link that brought you here is out of date."
        action={
          <Button
            href="/super/client-accounts"
            variant="secondary"
            size="sm"
            leftIcon="lucide:arrow-left"
            onClick={() => clearOrgSession()}
          >
            Back to all clients
          </Button>
        }
      />
    );
  }

  let tabContent = (
    <FeatureEmptyState
      icon="mdi:hammer-wrench"
      title={`${activeTab.label} is being built`}
      description="There is nothing to show on this tab yet."
    />
  );

  if (activeTab.id === "overview") {
    tabContent = (
      <ClientOverviewTab
        key={`${company.id}-${company.updatedAt}`}
        company={company}
        onEditSite={handleEditSiteFromOverview}
        onGoToSites={() => setActiveIndex(SITES_TAB_INDEX)}
        onGoToModules={() => setActiveIndex(MODULES_TAB_INDEX)}
      />
    );
  } else if (activeTab.id === "sites") {
    tabContent = (
      <ClientSitesTab
        organizationId={company.id}
        maxSites={company.maxSites}
        sitesUsed={company.sitesUsed}
        atSiteLimit={company.atSiteLimit}
        initialEditSiteId={pendingSiteEditId}
        onInitialEditConsumed={handleInitialEditConsumed}
      />
    );
  } else if (activeTab.id === "notifications") {
    tabContent = (
      <ClientNotificationsTab
        key={company.id}
        companyName={company.name}
        activatedModules={company.activatedModules}
      />
    );
  } else if (activeTab.id === "modules") {
    tabContent = (
      <ClientModulesTab
        key={`${company.id}-${company.activatedModules}`}
        company={company}
      />
    );
  } else if (activeTab.id === "access") {
    tabContent = (
      <ClientSubscriptionTab
        organizationId={company.id}
        companyName={company.name}
        accessExpiresAt={company.accessExpiresAt}
        daysRemaining={company.daysRemaining}
        maxSeats={company.maxSeats}
        maxSites={company.maxSites}
        seatsUsed={company.seatsUsed}
        sitesUsed={company.sitesUsed}
        seatsAvailable={company.seatsAvailable}
        sitesAvailable={company.sitesAvailable}
        atSeatLimit={company.atSeatLimit}
        atSiteLimit={company.atSiteLimit}
      />
    );
  }

  const subtitle =
    [company.industry, company.code ? `Code ${company.code}` : null]
      .filter(Boolean)
      .join(" · ") || `Organization ID ${company.id}`;

  const access = accessSummary(company.accessExpiresAt, company.daysRemaining);
  const moduleCount = parseActivatedModuleCodes(company.activatedModules).length;

  // The five facts that decide what a staff member can do to this account.
  // They used to live on the Overview and Access tabs only, so four of the five
  // tabs gave no clue what state the account was in.
  const vitals: ClientVital[] = [
    { label: "Access", value: access.label, alert: access.lapsed },
    {
      label: "Expires",
      value: company.accessExpiresAt
        ? formatShortDate(company.accessExpiresAt)
        : "Never",
    },
    {
      label: "Seats",
      value: formatUsage(company.seatsUsed, company.maxSeats),
      alert: company.atSeatLimit ?? false,
    },
    {
      label: "Sites",
      value: formatUsage(
        company.sitesUsed ?? company.siteCount,
        company.maxSites,
      ),
      alert: company.atSiteLimit ?? false,
    },
    { label: "Modules", value: `${moduleCount} active` },
  ];

  return (
    <div className="flex flex-col gap-3.5 pb-4">
      {/* This page used to build its own header — a bare `<h1>` in a hand-rolled
          glass band with the back link stacked above it — so it was the one
          detail screen that did not look like the rest of the product. It is
          `PageHeader` now, which also makes the page title the document's only
          h1 at the same type scale as every other screen.

          The "All clients" link stays a Button rather than becoming a
          `breadcrumbs` entry because leaving this page has to call
          `clearOrgSession()`, and `BreadCrumb` navigates on its own. */}
      <PageHeader
        title={company.name}
        description={subtitle}
        actions={
          <>
            <Button
              href="/super/client-accounts"
              variant="ghost"
              size="sm"
              leftIcon="lucide:arrow-left"
              onClick={() => clearOrgSession()}
            >
              All clients
            </Button>
            <ClientAccessWindowActions
              organizationId={company.id}
              companyName={company.name}
              accessExpiresAt={company.accessExpiresAt}
              daysRemaining={company.daysRemaining}
            />
          </>
        }
      />

      {/* Identity, vitals and the tab strip are one surface. The tabs belong to
          this client, and drawing them as a third free-floating slab under the
          header was most of what made the page read as five separate screens. */}
      <ClientVitalsBand
        name={company.name}
        meta={[
          `ID ${company.id}`,
          company.code ? `Code ${company.code}` : null,
          company.industry,
          `${company.userCount} user${company.userCount === 1 ? "" : "s"}`,
        ]}
        status={access.expired ? "inactive" : "active"}
        statusLabel={access.expired ? "Access lapsed" : "Active"}
        vitals={vitals}
        footer={
          // The strip scrolls rather than wrapping: five tabs wrapping to a
          // second line moved the content under the user's cursor on a narrow
          // window.
          <div className="border-ehs-hairline/70 overflow-x-auto border-t px-1">
            <TabBar
              tabs={[...TABS]}
              activeIndex={activeIndex}
              onChange={handleTabChange}
              label="Client sections"
              className="min-w-max"
            />
          </div>
        }
      />

      {tabContent}
    </div>
  );
}
