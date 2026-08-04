import type { ReactNode } from "react";

export function DetailCard({
  title,
  description,
  action,
  children,
  className = "",
}: Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}>) {
  return (
    <section
      className={`rounded-[20px] border border-white bg-white/62 p-5.5 shadow-xl backdrop-blur-[10px] ${className}`.trim()}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-darkest">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-gray">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
