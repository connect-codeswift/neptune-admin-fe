"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import {
  DEFAULT_SUBSCRIPTIONS,
  getSubscriptionStats,
  type Subscription,
} from "@/lib/dummy-subscriptions";
import { DEFAULT_PRICING_RATES } from "@/lib/pricing-rates";
import { SubscriptionModal } from "./SubscriptionModal";
import { SubscriptionsTable } from "./SubscriptionsTable";

function StatCard({
  value,
  label,
}: Readonly<{ value: string | number; label: string }>) {
  return (
    <article className="flex min-h-24 flex-col justify-center rounded-[20px] border border-white/90 bg-white/62 px-5 py-4 shadow-lg backdrop-blur-[10px]">
      <p className="text1 text-darkest">{value}</p>
      <p className="mt-1 text6 text-gray">{label}</p>
    </article>
  );
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(DEFAULT_SUBSCRIPTIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(
    () => getSubscriptionStats(subscriptions),
    [subscriptions],
  );

  const subscribedOrganizationIds = useMemo(
    () => subscriptions.map((entry) => entry.organizationId),
    [subscriptions],
  );

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (subscription: Subscription) => {
    setEditing(subscription);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (updated: Subscription) => {
    setSaving(true);

    setSubscriptions((current) => {
      const exists = current.some((entry) => entry.id === updated.id);
      if (exists) {
        return current.map((entry) =>
          entry.id === updated.id ? updated : entry,
        );
      }
      return [updated, ...current];
    });

    await new Promise((resolve) => setTimeout(resolve, 300));
    toast.success(`Subscription saved for ${updated.organizationName}.`);
    setSaving(false);
    closeModal();
  };

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Subscriptions"
        description="Yearly contracts per client. Each one freezes the prices agreed at signing."
        breadcrumbs={[
          { label: "Super Admin", href: "/super/dashboard" },
          { label: "Subscriptions" },
        ]}
        actions={
          <Button size="sm" leftIcon="lucide:plus" onClick={openCreateModal}>
            Create Subscription
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard value={stats.total} label="Subscriptions" />
        <StatCard value={stats.active} label="Active" />
        <StatCard
          value={`$${stats.totalArr.toLocaleString()}`}
          label="Total ARR"
        />
        <StatCard value={stats.expiringSoon} label="Expiring in 90 Days" />
      </div>

      <SubscriptionsTable
        subscriptions={subscriptions}
        onEdit={openEditModal}
        onCreate={openCreateModal}
      />

      <SubscriptionModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        subscription={editing}
        rates={DEFAULT_PRICING_RATES}
        subscribedOrganizationIds={subscribedOrganizationIds}
        loading={saving}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
