import type { Metadata } from "next";
import "./globals.css";
import { inter } from "@/fonts/inter";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

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
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      // The theme script below writes `data-theme` on this element before React
      // hydrates, so the server-rendered markup and the client's first pass
      // necessarily differ on that attribute. That difference is the point.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so a dark-theme user never sees a white
            flash. It only writes `data-theme` / `color-scheme` on <html>;
            ThemeProvider adopts that value on mount rather than recomputing
            it and repainting. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${inter.className} min-h-screen w-full font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            {/* No background fill here any more. The ambient ground is
                `--ehs-shell-bg` on `body`, which changes with the theme; a
                `bg-bg` on this wrapper painted an opaque sheet over it. */}
            <main className="w-full flex-1">{children}</main>
            <ToastProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
