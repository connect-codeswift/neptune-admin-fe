"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";
import { GlassCard } from "../ui/GlassCard";
import { PageHeader } from "./PageHeader";

export type PlaceholderPageProps = {
  title: string;
  description?: string;
  /** Empty-state glyph. Defaults to the "under construction" wrench. */
  icon?: string;
  /** Empty-state heading, under the icon. */
  emptyTitle?: string;
  /** One line of body copy under the heading. */
  emptyDescription?: string;
  children?: ReactNode;
};

/**
 * The stand-in for a route whose screen has not been built yet.
 *
 * It used to be a bare `h1` + `p` in a `p-6` div, which read as an unstyled
 * page rather than a deliberate gap — six live routes render it. Now it wears
 * the same chrome as a real screen, so the shell around it is right and only
 * the content is missing.
 */
export function PlaceholderPage({
  title,
  description = "Placeholder — content coming soon.",
  icon = "mdi:hammer-wrench",
  emptyTitle = "This screen is being built",
  emptyDescription = "There is nothing to show here yet. It will appear once the module behind this route is wired up.",
  children,
}: Readonly<PlaceholderPageProps>) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />

      <GlassCard className="items-center gap-3 px-6 py-14 text-center">
        <span
          className="inline-flex size-12 items-center justify-center rounded-2xl bg-ehs-icon-bg text-ehs-normal-blue"
          aria-hidden
        >
          <Icon icon={icon} width={24} height={24} />
        </span>
        <h2 className="text3 text-ehs-darker">{emptyTitle}</h2>
        <p className="text4 max-w-md text-ehs-muted-text">{emptyDescription}</p>
        {children}
      </GlassCard>
    </div>
  );
}
