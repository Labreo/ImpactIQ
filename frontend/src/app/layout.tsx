import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://impact-iq-silk.vercel.app"),
  title: "ImpactIQ — Near-Earth Object Impact Intelligence",
  description:
    "Real-time asteroid impact risk analysis powered by NASA/JPL orbital data, Monte Carlo simulation, and IBM Granite AI. Track near-Earth objects, model impact consequences, and assess planetary defense scenarios.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
  openGraph: {
    title: "ImpactIQ — Near-Earth Object Impact Intelligence",
    description:
      "Real-time asteroid impact risk analysis powered by NASA/JPL orbital data, Monte Carlo simulation, and IBM Granite AI.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "ImpactIQ Planetary Defense Logo" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
