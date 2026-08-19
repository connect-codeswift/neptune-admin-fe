import type { ReactNode } from "react";
import { GLASS_SURFACE } from "../ui/GlassCard";
import { BreadCrumb, type BreadCrumbItem } from "../ui/BreadCrumb";

export type PageHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs?: BreadCrumbItem[];
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className = "",
}: Readonly<PageHeaderProps>) {
  return (
    // The same frosted pane every card on the page uses. It was a solid
    // `bg-ehs-surface` panel, which made the header the one opaque plate on a
    // page of glass — it read as a different material sitting on top of the
    // design rather than as part of it.
    <header
      className={`${GLASS_SURFACE} animate-card-rise flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <BreadCrumb items={breadcrumbs} className="mb-1" />
        ) : null}
        <h1 className="text1 text-ehs-darker">{title}</h1>
        {description ? (
          <p className="text4 text-ehs-muted-text">{description}</p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
