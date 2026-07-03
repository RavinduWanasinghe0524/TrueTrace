import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TrueTrace — AI Photo Authenticity Detection | IronLogix",
  description:
    "Instantly detect if a photo or document has been manipulated or edited. Free AI-powered forensic analysis. No signup required — just upload and get results in seconds.",
  keywords:
    "photo authenticity, image manipulation detection, fake photo detector, photo forensics, editing detection, IronLogix, TrueTrace, AI forensics, ELA analysis",
  openGraph: {
    title: "TrueTrace — AI Photo Authenticity Detection",
    description:
      "Upload any photo and discover if it's been manipulated. Free, fast, private.",
    type: "website",
    siteName: "TrueTrace by IronLogix",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueTrace — AI Photo Authenticity Detection",
    description:
      "Free AI-powered photo manipulation detector. Know the truth instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#030712" />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "var(--font-body, Inter), sans-serif" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
