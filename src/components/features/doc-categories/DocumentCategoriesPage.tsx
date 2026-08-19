"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { DocumentCategoryForm } from "./DocumentCategoryForm";
import { DocumentCategoryGrid } from "./DocumentCategoryGrid";
import { DocumentCategoryStatsRow } from "./DocumentCategoryStatsRow";
import { useDocCategoriesPaths } from "./useDocCategoriesPaths";

export function DocumentCategoriesPage() {
  const { adminHref } = useDocCategoriesPaths();
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    // Header → stats → (create form) → content, in the same `gap-6` rhythm the
    // other catalog screens use.
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Document Categories"
        description="Manage document category types used across the platform"
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Document Admin" },
          { label: "Categories" },
        ]}
        actions={
          <Button
            size="sm"
            leftIcon="lucide:plus"
            onClick={() => setShowCreateForm(true)}
          >
            New Category
          </Button>
        }
      />

      <DocumentCategoryStatsRow />

      {showCreateForm ? (
        <DocumentCategoryForm onCancel={() => setShowCreateForm(false)} />
      ) : null}

      {/* The grid owns its own section heading and count, so the empty state can
          offer the same "add one" action the header carries. */}
      <DocumentCategoryGrid onCreate={() => setShowCreateForm(true)} />
    </div>
  );
}
