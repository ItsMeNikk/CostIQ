export interface CursorPlan {
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

export interface CursorConfig {
  tool: "cursor";
  displayName: string;
  plans: CursorPlan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const CURSOR: CursorConfig = {
  tool: "cursor",
  displayName: "Cursor",
  annualDiscount: 0.17,
  sourceUrl: "https://cursor.com/pricing",
  verifiedDate: "2026-01-15",
  plans: [
    {
      id: "free",
      name: "Hobby",
      priceMonthly: 0,
      pricePerSeat: null,
      billing: "individual",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: 1,
      notes: "Limited completions, basic features",
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 20,
      pricePerSeat: null,
      billing: "flat",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: 1,
      notes: "$20/mo, unlimited autocomplete, $10 off with annual",
    },
    {
      id: "business",
      name: "Business",
      priceMonthly: null,
      pricePerSeat: 30,
      billing: "per-seat",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: null,
      notes: "$30/seat/mo, admin controls, $20 off annual",
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
      notes: "Custom pricing, dedicated support, SSO",
    },
  ],
};