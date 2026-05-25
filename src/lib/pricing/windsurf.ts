export interface WindsurfPlan {
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

export interface WindsurfConfig {
  tool: "windsurf";
  displayName: string;
  plans: WindsurfPlan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const WINDSURF: WindsurfConfig = {
  tool: "windsurf",
  displayName: "Windsurf",
  annualDiscount: 0.17,
  sourceUrl: "https://codeium.com/windsurf pricing",
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
      notes: "Limited requests per day",
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 10,
      pricePerSeat: null,
      billing: "flat",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: 1,
      notes: "$10/mo, unlimited AI completions",
    },
    {
      id: "team",
      name: "Team",
      priceMonthly: null,
      pricePerSeat: 25,
      billing: "per-seat",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: null,
      notes: "$25/seat/mo, admin dashboard, team features",
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
      notes: "Custom pricing, SSO, dedicated support",
    },
  ],
};