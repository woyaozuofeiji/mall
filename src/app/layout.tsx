import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { absoluteUrl, getSiteUrl, SITE_NAME } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | Boutique Plush Toys, Jewelry & Gift Ideas`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Shop curated plush toys, jewelry and gift-ready accessories with bilingual browsing, secure checkout and international order tracking.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: getSiteUrl(),
    title: `${SITE_NAME} | Boutique Plush Toys, Jewelry & Gift Ideas`,
    description:
      "Shop curated plush toys, jewelry and gift-ready accessories with bilingual browsing, secure checkout and international order tracking.",
    images: [absoluteUrl("/index.png")],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Boutique Plush Toys, Jewelry & Gift Ideas`,
    description:
      "Shop curated plush toys, jewelry and gift-ready accessories with bilingual browsing, secure checkout and international order tracking.",
    images: [absoluteUrl("/index.png")],
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification
      ? {
          other: {
            "msvalidate.01": bingVerification,
          },
        }
      : {}),
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${cormorant.variable} font-sans text-slate-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
