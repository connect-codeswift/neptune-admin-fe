"use client";

import type { DummyRegulation } from "@/lib/dummy-regulations";
import { RegulationCard } from "./RegulationCard";

type RegulationListProps = Readonly<{
  regulations: DummyRegulation[];
}>;

export function RegulationList({ regulations }: RegulationListProps) {
  if (regulations.length === 0) {
    return (
      <p className="rounded-[20px] border border-white/90 bg-white/62 px-5 py-8 text-center text5 text-gray shadow-lg backdrop-blur-[10px]">
        No regulations match your search.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {regulations.map((regulation) => (
        <RegulationCard key={regulation.id} regulation={regulation} />
      ))}
    </div>
  );
}
