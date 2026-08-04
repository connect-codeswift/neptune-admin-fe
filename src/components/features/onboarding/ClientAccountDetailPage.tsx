"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import { TabBar } from "@/components/ui";
import { getClientAccountDetail } from "./client-accounts.mock";
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
  const client = getClientAccountDetail(clientId);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = TABS[activeIndex] ?? TABS[0];

  let tabContent = (
    <div className="rounded-[20px] border border-white bg-white/62 px-6 py-10 text-center text5 text-gray shadow-xl backdrop-blur-[10px]">
      {activeTab.label} content coming soon.
    </div>
  );

  if (activeTab.id === "overview") {
    tabContent = <ClientOverviewTab client={client} />;
  } else if (activeTab.id === "sites") {
    tabContent = <ClientSitesTab client={client} />;
  } else if (activeTab.id === "modules") {
    tabContent = <ClientModulesTab client={client} />;
  } else if (activeTab.id === "subscription") {
    tabContent = <ClientSubscriptionTab client={client} />;
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <header className="rounded-2xl border border-darkest/8 bg-white/62 px-5.5 py-5 shadow-xl backdrop-blur-[10px]">
        <Link
          href="/client-accounts"
          className="inline-flex items-center gap-1.5 text6 text-[#8892a3] hover:text-darkest"
        >
          <Icon icon="lucide:arrow-left" width={12} height={12} aria-hidden />
          All Clients
        </Link>
        <h1 className="mt-2 text2 text-darkest">{client.name}</h1>
        <p className="mt-1 text5 text-[#8892a3]">
          {client.industry} · Assigned to {client.assignedCsm}
        </p>
      </header>

      <TabBar
        tabs={[...TABS]}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
        label="Client sections"
      />

      {tabContent}
    </div>
  );
}
