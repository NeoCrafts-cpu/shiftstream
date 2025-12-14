import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ShiftStream | Agentic Settlement Layer",
  description: "Generate Smart Payment Links where funds settle into AI-controlled Smart Accounts. Automate escrow releases, revenue splits, and more.",
  keywords: ["crypto", "payments", "web3", "sideshift", "zerodev", "smart accounts", "ai agent"],
  openGraph: {
    title: "ShiftStream | Agentic Settlement Layer",
    description: "Generate Smart Payment Links where funds settle into AI-controlled Smart Accounts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-950 text-white`}
      >
        <WagmiProvider>
          {children}
        </WagmiProvider>
      </body>
    </html>
  );
}
