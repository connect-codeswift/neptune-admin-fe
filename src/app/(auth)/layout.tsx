import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full">
      <aside className="relative hidden w-1/2 overflow-hidden bg-darkest lg:block">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 size-100 rounded-full bg-blue-normal/12 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-10 size-75 rounded-full bg-[#3b82f6]/8 blur-[120px]"
        />

        <div className="relative z-10 flex h-full flex-col px-14 pt-14 pb-16">
          <Image
            src="/auth/neptune-wordmark-white.svg"
            alt="Neptune"
            width={302}
            height={23}
            className="h-5.75 w-75.5"
            unoptimized
            priority
          />

          <div className="mt-16 max-w-xl">
            <p className="text5 font-semibold tracking-[1px] text-[#8892a3] uppercase">
              Neptune EHSS Admin Portal
            </p>
            <h2 className="mt-3 text-[52px] leading-15 tracking-[-2px] text-white">
              Neptune Admin Portal
            </h2>
          </div>
        </div>
      </aside>

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
