"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";

const AUTH_FEATURES = [
  {
    icon: "lucide:building-2",
    title: "Multi-tenant administration",
    description:
      "Manage organizations, sites, and activated EHSS modules from a single control plane.",
  },
  {
    icon: "lucide:shield-check",
    title: "Access & governance",
    description:
      "Role-based permissions, MFA, and session controls keep every tenant isolated and secure.",
  },
  {
    icon: "lucide:layers-3",
    title: "Module activation",
    description:
      "Turn on incidents, CAPA, audits, compliance, PPE, and more per client subscription.",
  },
  {
    icon: "lucide:layout-dashboard",
    title: "Operational visibility",
    description:
      "Dashboards, user management, and configuration tools in one admin experience.",
  },
] as const;

const AUTH_HIGHLIGHTS = [
  { value: "14+", label: "EHSS modules" },
  { value: "Multi-site", label: "tenant support" },
  { value: "MFA", label: "built in" },
] as const;

export default function AuthLeftSection() {
  return (
    <aside className="relative hidden min-h-screen w-1/2 overflow-hidden bg-darkest lg:block">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -left-20 size-100 rounded-full bg-blue-normal/12 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-10 size-75 rounded-full bg-[#3b82f6]/8 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/3 size-60 -translate-y-1/2 rounded-full bg-blue-normal/6 blur-[100px]"
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
          <p className="text5 font-semibold tracking-[1px] text-[#8892a3] uppercase">
            Neptune EHSS Admin Portal
          </p>
          <h2 className="mt-3 text-[52px] leading-15 tracking-[-2px] text-white">
            Neptune Admin Portal
          </h2>
          <p className="mt-5 text5 leading-6 text-white/70">
            Configure clients, govern access, and operate Neptune EHSS across
            every organization you support, from onboarding through day-to-day
            administration.
          </p>

          <div className="mt-auto pt-8">
            <div className="grid grid-cols-3 gap-4">
              {AUTH_HIGHLIGHTS.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text4 text-white">{item.value}</p>
                  <p className="mt-1 text7 text-[#8892a3]">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text7 text-white/45">
              Enterprise-grade authentication with MFA and tenant-scoped access
              tokens.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
