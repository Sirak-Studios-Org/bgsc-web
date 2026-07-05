import type { Metadata } from "next";
import { Archivo_Black, Inter, Poppins } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { getConfig } from "@/lib/cms";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

export const viewport = {
  themeColor: "#8F0000",
};

const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://bgsc-web.vercel.app").trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Bad Girl Strength Club — You Were Never Meant to Stay Small",
  description: "Stop training to shrink. Start training to dominate. The strength program built for women who refuse to stay small.",
  openGraph: {
    title: "Bad Girl Strength Club",
    description: "You Were Never Meant to Stay Small. Join the standard.",
    url: SITE_URL,
    siteName: "Bad Girl Strength Club",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bad Girl Strength Club",
    description: "You Were Never Meant to Stay Small.",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let posthogKey: string | undefined;
  try {
    const config = await getConfig();
    posthogKey = config.posthog_key || undefined;
  } catch { /* non-critical */ }

  return (
    <html lang="en" className={`h-full ${poppins.variable} ${inter.variable} ${archivoBlack.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
      </head>
      <body className="min-h-full flex flex-col max-w-[2000px] mx-auto">
        {children}
        <Suspense>
          <Analytics posthogKey={posthogKey} />
        </Suspense>
      </body>
    </html>
  );
}
