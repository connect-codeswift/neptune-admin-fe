import AuthLeftSection from "@/components/layouts/AuthLeftSection";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <AuthLeftSection/>

      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-[#f3f5f8] px-6 py-12 lg:w-1/2">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-10 size-90 rounded-full bg-[#cffafe] opacity-60 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-20 size-80 rounded-full bg-[#dbeafe] opacity-60 blur-[100px]"
        />

        <div className="relative z-10 w-full max-w-105">{children}</div>
      </div>
    </div>
  );
}
