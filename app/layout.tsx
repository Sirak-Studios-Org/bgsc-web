import type { Metadata } from "next";
import { Archivo_Black, Inter, Poppins } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://bgsc-website-three.vercel.app"),
  title: "Bad Girl Strength Club — You Were Never Meant to Stay Small",
  description:
    "Stop training to shrink. Start training to dominate. The strength program built for women who refuse to stay small.",
  openGraph: {
    title: "Bad Girl Strength Club",
    description: "You Were Never Meant to Stay Small. Join the standard.",
    url: "https://bgsc-website-three.vercel.app",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full ${poppins.variable} ${inter.variable} ${archivoBlack.variable}`}>
      <body className="min-h-full flex flex-col max-w-[2000px] mx-auto">{children}</body>
    </html>
  );
}
