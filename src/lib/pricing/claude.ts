export interface ClaudePlan {
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

export interface ClaudeConfig {
  tool: "claude";
  displayName: string;
  plans: ClaudePlan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const CLAUDE: ClaudeConfig = {
  tool: "claude",
  displayName: "Claude",
  annualDiscount: 0.17,
  sourceUrl: "https://claude.ai/plans",
  verifiedDate: "2026-01-15",
  plans: [
    {
      id: "free",
      name: "Free",
      priceMonthly: 0,
      pricePerSeat: null,
      billing: "individual",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: 1,
      notes: "Limited messages, Claude 3.5 Sonnet",
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 20,
      pricePerSeat: null,
      billing: "individual",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: 1,
      notes: "$20/mo flat, unlimited Sonnet",
    },
    {
      id: "max",
      name: "Max",
      priceMonthly: 100,
      pricePerSeat: null,
      billing: "flat",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: 1,
      notes: "$100/mo, access to Claude 3.5 Opus and all models",
    },
    {
      id: "team",
      name: "Team",
      priceMonthly: null,
      pricePerSeat: 25,
      billing: "per-seat",
      annualDiscount: 0.17,
      minSeats: 5,
      maxSeats: null,
      notes: "$25/seat/mo, min 5 seats, higher rate limits",
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
      notes: "Custom pricing, SSO, admin controls",
    },
  ],
};