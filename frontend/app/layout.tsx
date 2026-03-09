import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImpactHook - Milestone-Gated DeFi Funding",
  description:
    "A Uniswap v4 hook that routes swap fees to impact projects based on verified milestones. Built for UHI Hookathon 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
