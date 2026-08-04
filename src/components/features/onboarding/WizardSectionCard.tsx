import type { ReactNode } from "react";

export function WizardSectionCard({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description?: string;
  children: ReactNode;
}>) {
  return (
    <section className="rounded-2xl border border-darkest/8 bg-white p-6 shadow-lg">
      <h2 className="text3 text-darkest">{title}</h2>
      {description ? (
        <p className="mt-1 text5 text-gray">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
