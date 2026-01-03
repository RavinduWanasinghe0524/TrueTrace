import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrueTrace - Document Forgery Detection | IronLogix",
  description: "Advanced AI-powered document forgery detection using Metadata Analysis, Error Level Analysis (ELA), and Noise Variance Detection. Powered by IronLogix.",
  keywords: "document forgery, image manipulation detection, ELA, metadata analysis, fraud detection, IronLogix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
