import type { ReactNode } from "react";
import { CardHeading } from "@/components/ui/CardHeading";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Titled panel used by both dashboards and the client-account tabs.
 *
 * It used to carry its own copy of the glass recipe and its own heading
 * markup; both now come from the shared primitives, so this file only decides
 * that a detail panel is a glass card with a heading above its content.
 *
 * `footer` exists for the same reason `h-full` gets passed in from the tab
 * layouts: cards that share a grid row are stretched to the tallest of them,
 * and a footer pinned with `mt-auto` keeps their control rows on one line
 * instead of floating wherever each card's content happens to end.
 *
 * It still lives under `onboarding/` because that is where it started and the
 * dashboards import it from here — moving it is a separate change.
 */
export function DetailCard({
  title,
  description,
  action,
  children,
  footer,
  className = "",
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Pinned to the bottom of the card, above its padding. */
  footer?: ReactNode;
  className?: string;
}>) {
  return (
    <GlassCard className={`p-5.5 ${className}`.trim()}>
      <CardHeading title={title} subtitle={description} action={action} />
      {children}
      {footer ? <div className="mt-auto pt-4">{footer}</div> : null}
    </GlassCard>
  );
}
