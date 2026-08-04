"use client";

import { useMemo, useState } from "react";
import { SearchInput } from "@/components/inputs";
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
  const [search, setSearch] = useState("");
  const { data: regulations = [], isLoading, isError, error } =
    useRegulationLibrary();

  const filteredRegulations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return regulations;
    return regulations.filter((regulation) =>
      matchesSearch(regulation, query),
    );
  }, [regulations, search]);

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

      <RegulationStatsRow regulations={regulations} />

      <SearchInput
        placeholder="Search regulations, articles, topics…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search regulations"
      />

      {isLoading ? (
        <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
          Loading regulations…
        </p>
      ) : null}

      {isError ? (
        <p className="rounded-[20px] border border-red/20 bg-red/5 px-5 py-8 text-center text5 text-red shadow-lg backdrop-blur-[10px]">
          {error instanceof Error
            ? error.message
            : "Failed to load regulations."}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <RegulationList regulations={filteredRegulations} />
      ) : null}
    </div>
  );
}
