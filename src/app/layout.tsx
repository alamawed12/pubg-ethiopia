import type { Metadata } from "next";
import { Inter, Oswald, JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PUBG MOBILE Community Assembly — Ethiopia",
  description:
    "An independently organized gathering of Ethiopia's PUBG MOBILE community. Players, teams, creators, and organizers — one battleground, one community.",
  keywords: [
    "PUBG MOBILE",
    "Ethiopia",
    "esports",
    "community",
    "tournament",
    "Addis Ababa",
    "gaming",
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/images/pubg-helmet-logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "PUBG MOBILE Community Assembly — Ethiopia",
    description:
      "More than a tournament. A gathering of players, teams, creators, and community builders shaping the future of PUBG MOBILE in Ethiopia.",
    type: "website",
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
      className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable} ${montserrat.variable}`}
    >
      <body className="film-grain">{children}</body>
    </html>
  );
}
