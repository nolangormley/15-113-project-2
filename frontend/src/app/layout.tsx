import type { Metadata } from "next";
import { Inter, Outfit, VT323 } from "next/font/google";
import "./globals.css";
import "./ai-tooltip.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-main" });
const orbitron = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Mnemosyne",
  description: "Fleshy Fuselage Measures Configurable Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
