"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export type BreadCrumbItem = {
  label: string;
  href?: string;
};

export type BreadCrumbProps = {
  items: BreadCrumbItem[];
  className?: string;
  /** Accessible name for the nav landmark. */
  label?: string;
};

function CrumbLink({
  href,
  children,
}: Readonly<{ href: string; children: string }>) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push(href);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-pointer text-gray transition-colors hover:text-darkest"
    >
      {children}
    </button>
  );
}

export function BreadCrumb({
  items,
  className = "",
  label = "Breadcrumb",
}: Readonly<BreadCrumbProps>) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const key = `${item.label}-${item.href ?? "current"}`;

          return (
            <li key={key} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden className="text-gray/70">
                  &gt;
                </span>
              ) : null}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "text-gray" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <CrumbLink href={item.href}>{item.label}</CrumbLink>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
