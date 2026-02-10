import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "Aurelius | Neuro-Symbolic Logic Engine",
  description: "A 3D Graph Reasoning Engine for verifiable AI inference.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans bg-[#050505] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
