export interface V0Plan {
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

export interface V0Config {
  tool: "v0";
  displayName: string;
  plans: V0Plan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const V0: V0Config = {
  tool: "v0",
  displayName: "v0",
  annualDiscount: 0,
  sourceUrl: "https://vercel.com/pricing",
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
      notes: "Limited generations per day",
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 20,
      pricePerSeat: null,
      billing: "flat",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: 1,
      notes: "$20/mo, unlimited generations",
    },
    {
      id: "team",
      name: "Team",
      priceMonthly: null,
      pricePerSeat: 30,
      billing: "per-seat",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "$30/seat/mo, team management features",
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
      notes: "Custom pricing, SLA, dedicated support",
    },
  ],
};