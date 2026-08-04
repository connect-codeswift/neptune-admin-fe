"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SearchInput } from "@/components/inputs";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui";
import { DUMMY_REGULATIONS } from "@/lib/dummy-regulations";
import { RegulationList } from "./RegulationList";
import { RegulationStatsRow } from "./RegulationStatsRow";
import { useRegulationLibraryPaths } from "./useRegulationLibraryPaths";

function matchesSearch(regulation: (typeof DUMMY_REGULATIONS)[number], query: string) {
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
  const router = useRouter();
  const { adminHref, basePath } = useRegulationLibraryPaths();
  const [search, setSearch] = useState("");

  const filteredRegulations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return DUMMY_REGULATIONS;
    return DUMMY_REGULATIONS.filter((regulation) =>
      matchesSearch(regulation, query),
    );
  }, [search]);

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
          <Button
            size="sm"
            leftIcon="lucide:plus"
            onClick={() => router.push(`${basePath}/new`)}
          >
            Add Regulation
          </Button>
        }
      />

      <RegulationStatsRow />

      <SearchInput
        placeholder="Search regulations, articles, topics…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search regulations"
      />

      <RegulationList regulations={filteredRegulations} />
    </div>
  );
}
