import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrueTrace - Photo Authenticity Detection | IronLogix",
  description: "Check if photos are real or edited. Free AI-powered tool to detect photo manipulation, editing, and forgery. Upload any image and get instant results.",
  keywords: "photo authenticity, image manipulation detection, fake photo detector, photo forensics, editing detection, IronLogix, TrueTrace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
