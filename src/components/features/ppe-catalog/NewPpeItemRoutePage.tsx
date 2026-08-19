"use client";

import { Icon } from "@iconify/react";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { GlassCard } from "@/components/ui/GlassCard";
import { usePpeCatalogPaths } from "./usePpeCatalogPaths";

/**
 * `/[company]/[site]/ppe-catalog/new` used to render the generic
 * `PlaceholderPage`, whose copy is "this screen is being built".
 *
 * That is not true here, and it is the worst kind of untrue: adding a PPE item
 * *is* built — it is the "Add PPE Item" modal on the catalog page — so the
 * route left the user believing the feature does not exist yet, with no link
 * out. The generic placeholder is right for LOTO, which genuinely has no
 * screen. It is wrong for a flow that works somewhere else.
 *
 * This page says where the flow actually lives and hands over a way back to it.
 *
 * Wire it up by pointing `src/app/[company]/[site]/ppe-catalog/new/page.tsx` at
 * this component instead of `PlaceholderPage` — that route file is outside this
 * pass's scope, so it still renders the placeholder until someone makes the
 * swap.
 */
export function NewPpeItemRoutePage() {
  const { adminHref, basePath } = usePpeCatalogPaths();

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Add a PPE Item"
        description="PPE items are added from the catalog itself."
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "PPE Catalog", href: basePath },
          { label: "New Item" },
        ]}
        actions={
          <Button size="sm" leftIcon="lucide:arrow-left" href={basePath}>
            Back to PPE Catalog
          </Button>
        }
      />

      <GlassCard className="items-center gap-3 px-6 py-14 text-center">
        <span
          className="inline-flex size-12 items-center justify-center rounded-2xl bg-ehs-icon-bg text-ehs-normal-blue"
          aria-hidden="true"
        >
          <Icon icon="lucide:package-plus" width={24} height={24} />
        </span>
        <h2 className="text3 text-ehs-darker">
          This step lives on the catalog page
        </h2>
        <p className="max-w-md text4 text-ehs-muted-text">
          There is no separate form for a new PPE item. Open the PPE Catalog and
          choose <strong className="text-ehs-darker">Add PPE Item</strong> — the
          dialog there captures the name, model, category and stock threshold,
          and the new item appears in the grid straight away.
        </p>
        <Button
          leftIcon="lucide:arrow-left"
          href={basePath}
          className="mt-1"
        >
          Go to the PPE Catalog
        </Button>
      </GlassCard>
    </div>
  );
}
