export interface ChatGPTPlan {
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

export interface ChatGPTConfig {
  tool: "chatgpt";
  displayName: string;
  plans: ChatGPTPlan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const CHATGPT: ChatGPTConfig = {
  tool: "chatgpt",
  displayName: "ChatGPT",
  annualDiscount: 0.17,
  sourceUrl: "https://openai.com/chatgpt/pricing",
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
      notes: "Rate limited, basic model access",
    },
    {
      id: "plus",
      name: "Plus",
      priceMonthly: 20,
      pricePerSeat: null,
      billing: "individual",
      annualDiscount: 0.17,
      minSeats: 1,
      maxSeats: 1,
      notes: "$20/mo flat, GPT-4o access",
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
      notes: "$25/seat/mo, min 5 seats, higher limits than Plus",
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
      notes: "Custom pricing, SSO, SOC2, dedicated support",
    },
  ],
};