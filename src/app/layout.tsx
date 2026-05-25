import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CostIQ — AI Spend Auditing",
  description:
    "CostIQ analyzes your AI subscriptions and cloud credits to uncover overspending and smarter alternatives.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%23141414'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='18' font-weight='bold' fill='white' font-family='system-ui'>$</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={inter.variable}>
      <body className="min-h-screen w-full overflow-x-hidden antialiased bg-[#d8eef4]">{children}</body>
    </html>
  );
}