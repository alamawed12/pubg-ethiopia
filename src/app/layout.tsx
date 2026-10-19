import type { Metadata } from "next";
import { Inter, Oswald, JetBrains_Mono } from "next/font/google";
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
      className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable}`}
    >
      <body className="film-grain">{children}</body>
    </html>
  );
}
