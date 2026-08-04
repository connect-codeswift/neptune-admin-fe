import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lightgray p-4">
      <div className="w-full max-w-md rounded-[20px] border border-white/90 bg-white/62 p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[10px]">
        {children}
      </div>
    </div>
  );
}
