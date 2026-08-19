"use client";

import type { DummyRegulation } from "@/lib/dummy-regulations";
import { FeatureEmptyState } from "@/components/features/shared";
import { Button } from "@/components/ui";
import { RegulationCard } from "./RegulationCard";

type RegulationListProps = Readonly<{
  regulations: DummyRegulation[];
  /**
   * The active search string. It is what separates "this library is empty" from
   * "your search matched nothing" — the second needs a way back, the first
   * needs a way in.
   */
  searchQuery?: string;
  onClearSearch?: () => void;
  /** Where "Add Regulation" goes, for the nothing-exists-yet case. */
  addHref?: string;
}>;

export function RegulationList({
  regulations,
  searchQuery = "",
  onClearSearch,
  addHref,
}: RegulationListProps) {
  const isSearching = searchQuery.trim() !== "";

  if (regulations.length === 0 && isSearching) {
    return (
      <FeatureEmptyState
        icon="lucide:file-search"
        title={`Nothing matches “${searchQuery.trim()}”`}
        description="The search covers citation codes, titles, descriptions and tags. Try a shorter phrase, or clear it to see the whole library."
        action={
          onClearSearch ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon="lucide:x"
              onClick={onClearSearch}
            >
              Clear search
            </Button>
          ) : null
        }
      />
    );
  }

  if (regulations.length === 0) {
    return (
      <FeatureEmptyState
        icon="lucide:book-open"
        title="No regulations yet"
        description="The library holds the codes and policies this organization is measured against. Nothing has been registered yet."
        action={
          addHref ? (
            <Button size="sm" leftIcon="lucide:plus" href={addHref}>
              Add your first regulation
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="stagger-cards flex flex-col gap-4">
      {regulations.map((regulation) => (
        <RegulationCard key={regulation.id} regulation={regulation} />
      ))}
    </div>
  );
}
