import type { ReactNode } from "react";
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
    <header
      className={`flex flex-col gap-4 rounded-2xl border border-darkest/8 bg-white px-6 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <BreadCrumb items={breadcrumbs} className="mb-2" />
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-darkest">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-gray">{description}</p>
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
