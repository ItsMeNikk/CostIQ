export interface CopilotPlan {
  id: string;
  name: string;
  priceMonthly: number | null;
  pricePerSeat: number | null;
  billing: "individual" | "per-seat" | "flat" | "custom" | "usage";
  annualDiscount: number;
  minSeats: number;
  maxSeats: number | null;
  notes: string;
}

export interface CopilotConfig {
  tool: "copilot";
  displayName: string;
  plans: CopilotPlan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const COPILOT: CopilotConfig = {
  tool: "copilot",
  displayName: "GitHub Copilot",
  annualDiscount: 0.17,
  sourceUrl: "https://github.com/features/copilot/pricing",
  verifiedDate: "2026-01-15",
  plans: [
    {
      id: "individual",
      name: "Individual",
      priceMonthly: 10,
      pricePerSeat: null,
      billing: "individual",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: 1,
      notes: "$10/mo, AI autocomplete for individuals",
    },
    {
      id: "business",
      name: "Business",
      priceMonthly: null,
      pricePerSeat: 19,
      billing: "per-seat",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: null,
      notes: "$19/seat/mo, org admin controls, IP indemnity",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      priceMonthly: null,
      pricePerSeat: null,
      billing: "custom",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "Custom pricing, SSO, full GitHub Enterprise Cloud features",
    },
  ],
};