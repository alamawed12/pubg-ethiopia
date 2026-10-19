import { Inter, Oswald, JetBrains_Mono } from 'next/font/google';

/**
 * Body font: Inter
 * Weights: 400 (regular), 500 (medium), 600 (semibold)
 */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

/**
 * Heading font: Oswald (tactical/condensed esports style)
 * Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
 */
export const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

/**
 * Monospace font: JetBrains Mono (tactical data & telemetry)
 * Weights: 400 (regular), 500 (medium), 700 (bold)
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

// Aliases for alternate naming conventions
export const fontBody = inter;
export const fontHeading = oswald;
export const fontMono = jetbrainsMono;
export const fontInter = inter;
export const fontOswald = oswald;

/**
 * Combined CSS variable string ready to be injected into the <html> or <body> class list.
 * Example: <html lang="en" className={fontVariables}>
 */
export const fontVariables = `${inter.variable} ${oswald.variable} ${jetbrainsMono.variable}`;

export default fontVariables;
