import type { ReactNode } from "react";

export type PlaceholderPageProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PlaceholderPage({
  title,
  description = "Placeholder — content coming soon.",
  children,
}: Readonly<PlaceholderPageProps>) {
  return (
    <div className="p-6">
      <h1 className="text1 text-darkest">{title}</h1>
      <p className="mt-2 text5 text-gray">{description}</p>
      {children}
    </div>
  );
}
