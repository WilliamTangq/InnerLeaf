import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner";
import { AuthProvider } from "./components/auth-provider";
import { LanguageProvider } from "./components/language-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://innerleaf.io"),
  title: "InnerLeaf — Structured reflection for emotional moments",
  description:
    "Turn emotional reactions into structured reflection cards, separate facts from interpretation, and notice repeated patterns over time.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "InnerLeaf — Structured reflection for emotional moments",
    description:
      "Turn emotional reactions into structured reflection cards, separate facts from interpretation, and notice repeated patterns over time.",
    type: "website",
    images: ["/logo.png"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast:
                "border border-[rgba(40,80,60,0.12)] bg-[rgb(255,254,248)] text-[var(--foreground)] shadow-[var(--shadow-lg)]",
              description: "text-[var(--foreground-muted)]",
            },
          }}
        />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
