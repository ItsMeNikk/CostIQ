export interface GeminiPlan {
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

export interface GeminiConfig {
  tool: "gemini";
  displayName: string;
  plans: GeminiPlan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const GEMINI: GeminiConfig = {
  tool: "gemini",
  displayName: "Gemini",
  annualDiscount: 0,
  sourceUrl: "https://gemini.google.com/pricing",
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
      notes: "Limited usage, Gemini 2.0 Flash",
    },
    {
      id: "pro",
      name: "Advanced",
      priceMonthly: 19.99,
      pricePerSeat: null,
      billing: "individual",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: 1,
      notes: "$19.99/mo, Gemini Ultra, advanced reasoning",
    },
    {
      id: "ultra",
      name: "Ultra",
      priceMonthly: null,
      pricePerSeat: null,
      billing: "custom",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "Custom pricing for large orgs",
    },
  ],
};