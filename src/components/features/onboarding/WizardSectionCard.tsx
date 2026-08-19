import type { ReactNode } from "react";
import { CardHeading } from "@/components/ui/CardHeading";
import { GLASS_SURFACE } from "@/components/ui/GlassCard";

/**
 * One card of the add-a-company wizard. A step is free to be more than one of
 * these — "Organization" and "Activated modules" are two different questions
 * and read better as two cards in the stack than as one long panel.
 *
 * It carried its own opaque `bg-ehs-surface` panel, which made it the only
 * solid plate on a page whose header and every other card are frosted glass.
 * It takes `GLASS_SURFACE` now so the wizard reads as part of the same product
 * as the screens either side of it, and its title row is `CardHeading` so it
 * cannot drift from every other card heading in the app.
 */
export function WizardSectionCard({
  title,
  description,
  action,
  className = "",
  children,
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}>) {
  return (
    <section
      className={`${GLASS_SURFACE} animate-card-rise flex min-w-0 flex-col gap-4 p-4.75 ${className}`.trim()}
    >
      <CardHeading title={title} subtitle={description} action={action} />
      <div className="min-w-0">{children}</div>
    </section>
  );
}
