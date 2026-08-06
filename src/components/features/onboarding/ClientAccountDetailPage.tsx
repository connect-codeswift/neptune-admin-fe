"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TabBar } from "@/components/ui";
import { useClientAccountDetail } from "@/hooks/useClientAccountDetail";
import { getOrgToken } from "@/lib/auth-tokens";
import { enterOrganization } from "@/lib/select-company-flow";
import { ClientModulesTab } from "./ClientModulesTab";
import { ClientOverviewTab } from "./ClientOverviewTab";
import { ClientSitesTab } from "./ClientSitesTab";
import { ClientSubscriptionTab } from "./ClientSubscriptionTab";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "sites", label: "Sites" },
  { id: "modules", label: "Modules" },
  { id: "subscription", label: "Subscription" },
] as const;

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
  const [establishedForOrgId, setEstablishedForOrgId] = useState<number | null>(
    null,
  );
  const [orgContextError, setOrgContextError] = useState<string | null>(null);
  const [ensuringOrgContext, setEnsuringOrgContext] = useState(false);

  const activeTab = TABS[activeIndex] ?? TABS[0];

  const orgContextReady =
    Boolean(getOrgToken()) ||
    (company?.id != null && establishedForOrgId === company.id);

  const ensureOrgContext = useCallback(async () => {
    if (!company) return;

    setEnsuringOrgContext(true);
    setOrgContextError(null);
    try {
      await enterOrganization({
        organizationId: company.id,
        organizationName: company.name,
      });
      setEstablishedForOrgId(company.id);
    } catch (contextError) {
      const message =
        contextError instanceof Error
          ? contextError.message
          : "Failed to select organization.";
      setOrgContextError(message);
      toast.error(message);
    } finally {
      setEnsuringOrgContext(false);
    }
  }, [company]);

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    if (!company) return;
    if (getOrgToken() || establishedForOrgId === company.id) return;

    const frameId = requestAnimationFrame(() => {
      void ensureOrgContext();
    });

    return () => cancelAnimationFrame(frameId);
  }, [company, establishedForOrgId, ensureOrgContext]);

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

  const subscriptionClient = {
    id: String(company.id),
    name: company.name,
    industry: company.industry ?? "—",
    assignedCsm: "—",
    code: company.code ?? String(company.id),
    contractStart: company.createdAt,
    legalName: company.legalName ?? company.name,
    website: company.website ?? "",
    employeeCount: company.employeeCount ?? 0,
    siteCount: company.siteCount,
    complianceZone: company.complianceZone ?? "—",
    primaryContact: {
      initials: (company.primaryContactName ?? company.name)
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      name: company.primaryContactName ?? "—",
      title: company.primaryContactTitle ?? "—",
      email: company.primaryContactEmail ?? "—",
      phone: company.primaryContactPhone ?? "—",
    },
    contract: {
      planType: "—",
      period: "—",
      licenseSeats: "—",
      assignedCsm: "—",
    },
    employeeData: {
      fileName: "—",
      status: "Uploaded" as const,
      lastUpdated: "—",
    },
    sites: [],
    subscription: {
      statusLabel: "No subscription",
      planType: "—",
      trialStartDate: "—",
      trialEndDate: "—",
      daysRemaining: company.daysRemaining ?? 0,
      billingContact: "—",
      seats: { used: company.userCount, total: company.userCount },
      history: [],
    },
  };

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
      />
    );
  } else if (activeTab.id === "sites") {
    tabContent = (
      <ClientSitesTab
        organizationId={company.id}
        orgContextReady={orgContextReady}
        orgContextError={orgContextError}
        onEnsureOrgContext={() => void ensureOrgContext()}
        ensuringOrgContext={ensuringOrgContext}
      />
    );
  } else if (activeTab.id === "modules") {
    tabContent = (
      <ClientModulesTab
        key={`${company.id}-${company.activatedModules}`}
        company={company}
      />
    );
  } else if (activeTab.id === "subscription") {
    tabContent = <ClientSubscriptionTab client={subscriptionClient} />;
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header className="rounded-2xl border border-darkest/8 bg-white/62 px-5.5 py-5 shadow-lg backdrop-blur-[10px]">
        <Link
          href="/super/client-accounts"
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
