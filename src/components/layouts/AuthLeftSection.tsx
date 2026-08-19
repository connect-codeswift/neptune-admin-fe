"use client";

import Image from "next/image";

const AUTH_HIGHLIGHTS = [
  { value: "14+", label: "EHSS modules" },
  { value: "Multi-site", label: "tenant support" },
  { value: "MFA", label: "built in" },
] as const;

/**
 * The sign-in brand panel.
 *
 * `bg-ehs-canvas-dark` rather than the ink token: this panel is dark *by
 * design*, not by theme — it carries the white Neptune wordmark, so inverting
 * it in light mode would put white artwork on a white panel. Its copy is
 * therefore pinned to `--ehs-canvas-dark-text` / `--ehs-light-text` instead of
 * the flipping text roles.
 */
export default function AuthLeftSection() {
  return (
    <aside className="relative hidden min-h-screen w-1/2 overflow-hidden bg-ehs-canvas-dark text-ehs-canvas-dark-text lg:block">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 size-100 rounded-full bg-ehs-normal-blue/12 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-10 size-75 rounded-full bg-ehs-blue/8 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/3 size-60 -translate-y-1/2 rounded-full bg-ehs-normal-blue/6 blur-[100px]"
      />

      <div className="relative z-10 flex min-h-screen flex-col px-14 pt-14 pb-16">
        <Image
          src="/auth/neptune-wordmark-white.svg"
          alt="Neptune"
          width={302}
          height={23}
          className="h-5.75 w-75.5"
          unoptimized
          priority
        />

        <div className="mt-16 flex max-w-xl flex-1 flex-col">
          <p className="text6 text-ehs-muted-text">
            Neptune EHSS Admin Portal
          </p>
          <h2 className="mt-3 text-[52px] leading-15 tracking-[-2px] text-ehs-light-text">
            Neptune Admin Portal
          </h2>
          <p className="mt-5 text4 leading-6 text-ehs-light-text/70">
            Configure clients, govern access, and operate Neptune EHSS across
            every organization you support, from onboarding through day-to-day
            administration.
          </p>

          <div className="mt-auto pt-8">
            <div className="grid grid-cols-3 gap-4">
              {AUTH_HIGHLIGHTS.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text5 text-ehs-light-text">{item.value}</p>
                  <p className="mt-1 text8 text-ehs-muted-text">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text8 text-ehs-light-text/45">
              Enterprise-grade authentication with MFA and tenant-scoped access
              tokens.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
