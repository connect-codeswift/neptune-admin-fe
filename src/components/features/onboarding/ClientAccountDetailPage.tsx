"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { TabBar } from "@/components/ui";
import { useClientAccountDetail } from "@/hooks/useClientAccountDetail";
import { clearOrgSession } from "@/lib/auth-tokens";
import { ClientModulesTab } from "./ClientModulesTab";
import { ClientOverviewTab } from "./ClientOverviewTab";
import { ClientSitesTab } from "./ClientSitesTab";
import { ClientSubscriptionTab } from "./ClientSubscriptionTab";
import { ClientAccessWindowActions } from "./ClientAccessWindowPanel";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sites", label: "Sites" },
  { id: "modules", label: "Modules" },
  { id: "access", label: "Access & Limits" },
] as const;

const SITES_TAB_INDEX = TABS.findIndex((tab) => tab.id === "sites");

export function ClientAccountDetailPage({
  clientId,
}: Readonly<{ clientId: string }>) {
  const organizationId = Number(clientId);
  const {
    data: company,
    isLoading,
    isError,
    error,
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
    return (
      <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-10 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
        Loading client account…
      </p>
    );
  }

  if (isError || !company) {
    return (
      <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-10 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
        {error instanceof Error ? error.message : "Client account not found."}
      </p>
    );
  }

  let tabContent = (
    <div className="rounded-[20px] border border-white bg-white/62 px-6 py-10 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
      {activeTab.label} content coming soon.
    </div>
  );

  if (activeTab.id === "overview") {
    tabContent = (
      <ClientOverviewTab
        key={`${company.id}-${company.updatedAt}`}
        company={company}
        onEditSite={handleEditSiteFromOverview}
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

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header className="rounded-2xl border border-darkest/8 bg-white/62 px-5.5 py-5 shadow-lg backdrop-blur-[10px]">
        <Link
          href="/super/client-accounts"
          onClick={() => clearOrgSession()}
          className="inline-flex items-center gap-1.5 text6 text-[#8892a3] hover:text-darkest"
        >
          <Icon icon="lucide:arrow-left" width={12} height={12} aria-hidden />
          All Clients
        </Link>
        <h1 className="mt-2 text2 text-darkest">{company.name}</h1>
        <p className="mt-1 text5 text-[#8892a3]">
          {[company.industry, company.code ? `Code ${company.code}` : null]
            .filter(Boolean)
            .join(" · ") || `Organization ID ${company.id}`}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <ClientAccessWindowActions
            organizationId={company.id}
            companyName={company.name}
            accessExpiresAt={company.accessExpiresAt}
            daysRemaining={company.daysRemaining}
            size="md"
          />
        </div>
      </header>

      <TabBar
        tabs={[...TABS]}
        activeIndex={activeIndex}
        onChange={handleTabChange}
        label="Client sections"
      />

      {tabContent}
    </div>
  );
}
