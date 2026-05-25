import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Spend Audit — CostIQ",
  description:
    "Tell us which AI tools your team uses and get a personalized savings report in minutes.",
};

export default function AuditLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
