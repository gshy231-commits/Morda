import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://twinheadsnake.com"),
  title: {
    default: "TwinHeadSnake - Algorithmic Crypto Trading Signals",
    template: "%s | TwinHeadSnake",
  },
  description: "Algorithmic crypto trading signals with 87% win rate. Join 2,847+ traders already profiting with real-time Bybit signals.",
  keywords: ["crypto trading", "trading signals", "bitcoin", "ethereum", "bybit", "algorithmic trading"],
  authors: [{ name: "TwinHeadSnake" }],
  creator: "TwinHeadSnake",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://twinheadsnake.com",
    siteName: "TwinHeadSnake",
    title: "TwinHeadSnake - Algorithmic Crypto Trading Signals",
    description: "Stop guessing, start profiting. Algorithmic crypto signals with 87% win rate.",
    images: [
      {
        url: "https://twinheadsnake.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "TwinHeadSnake Trading Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TwinHeadSnake - Algorithmic Crypto Trading Signals",
    description: "Stop guessing, start profiting. Algorithmic crypto signals with 87% win rate.",
    images: ["https://twinheadsnake.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${sora.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#030306] text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
