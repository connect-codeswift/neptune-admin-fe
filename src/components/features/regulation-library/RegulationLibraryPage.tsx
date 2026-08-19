"use client";

import { useId, useState } from "react";
import { SearchInput } from "@/components/inputs";
import {
  FeatureErrorCard,
  FeatureLoadingGrid,
} from "@/components/features/shared";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { useRegulationLibrary } from "@/hooks/useRegulationLibrary";
import { RegulationList } from "./RegulationList";
import { RegulationStatsRow } from "./RegulationStatsRow";
import { useRegulationLibraryPaths } from "./useRegulationLibraryPaths";

function matchesSearch(
  regulation: {
    code: string;
    title: string;
    description: string;
    tags: string[];
  },
  query: string,
) {
  const haystack = [
    regulation.code,
    regulation.title,
    regulation.description,
    ...regulation.tags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function RegulationLibraryPage() {
  const { adminHref, basePath } = useRegulationLibraryPaths();
  const sectionHeadingId = useId();
  const [search, setSearch] = useState("");
  // `isPending` (not `isLoading`) so the list keeps its loading state while the
  // query is still gated on the tenant scope — a disabled query reports
  // `isLoading === false` with no data, which would flash the empty list.
  const { data: regulations = [], isPending, isError, error, refetch } =
    useRegulationLibrary();

  // No `useMemo`: React Compiler is on for this app, and the repo's rule is that
  // components do not hand-memoize.
  const query = search.trim().toLowerCase();
  let filteredRegulations = regulations;
  if (query) {
    filteredRegulations = regulations.filter((regulation) =>
      matchesSearch(regulation, query),
    );
  }

  const ready = !isPending && !isError;

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Regulations Library"
        description="All compliance, regulatory requirements and compliance trackers."
        breadcrumbs={[
          { label: "Admin", href: adminHref },
          { label: "Regulations" },
        ]}
        actions={
          <Button size="sm" leftIcon="lucide:plus" href={`${basePath}/new`}>
            Add Regulation
          </Button>
        }
      />

      {/* The stat row used to compute over an empty array while the query was
          still in flight, so the page opened on four confident zeros. */}
      {isPending ? (
        <FeatureLoadingGrid
          count={4}
          label="Loading regulation stats…"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        />
      ) : null}
      {ready ? <RegulationStatsRow regulations={regulations} /> : null}

      <section aria-labelledby={sectionHeadingId} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={sectionHeadingId} className="text3 text-ehs-darker">
            All Regulations
          </h2>
          {ready && regulations.length > 0 ? (
            <p className="text8 text-ehs-muted-text">
              Showing {filteredRegulations.length} of {regulations.length}{" "}
              regulation{regulations.length === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>

        <SearchInput
          placeholder="Search regulations, articles, topics…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search regulations"
          disabled={isPending || isError}
        />

        {isPending ? (
          // Card-shaped, not a paragraph of grey bars: the list is a stack of
          // wide rows, and the placeholder should say so.
          <FeatureLoadingGrid
            count={4}
            label="Loading regulations…"
            className="flex flex-col gap-4"
            cardClassName="min-h-36"
          />
        ) : null}

        {isError ? (
          <FeatureErrorCard
            title="Couldn’t load regulations"
            message={
              error instanceof Error
                ? error.message
                : "Failed to load regulations."
            }
            onRetry={() => {
              void refetch();
            }}
          />
        ) : null}

        {ready ? (
          <RegulationList
            regulations={filteredRegulations}
            searchQuery={search}
            onClearSearch={() => setSearch("")}
            addHref={`${basePath}/new`}
          />
        ) : null}
      </section>
    </div>
  );
}
