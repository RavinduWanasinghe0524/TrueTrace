import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
