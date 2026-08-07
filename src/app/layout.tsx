import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { inter } from "@/fonts/inter";
import { QueryProvider } from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: {
    default: "Admin | Neptune EHSS",
    template: "%s | Admin | Neptune EHSS",
  },
  description:
    "Neptune is the intelligent EHSS platform that unifies incident management, compliance, and sustainability for operational teams.",
  openGraph: {
    title: "Admin | Neptune EHSS",
    description:
      "One platform for safety, compliance, and sustainability, built for frontline and EHS teams.",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/favicon-black.png",
        type: "image/png",
        sizes: "512x512",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-white.png",
        type: "image/png",
        sizes: "512x512",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className={`${inter.className} min-h-screen w-full font-sans`}>
        <QueryProvider>
          <main className="bg-bg w-full flex-1">{children}</main>
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
