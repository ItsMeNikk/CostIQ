export interface APIPlan {
  id: string;
  name: string;
  priceMonthly: number | null;
  pricePerSeat: number | null;
  billing: "individual" | "per-seat" | "flat" | "custom" | "usage";
  annualDiscount: number;
  minSeats: number;
  maxSeats: number | null;
  notes: string;
  modelPricing?: {
    input: number;   // per 1M tokens
    output: number;  // per 1M tokens
    model: string;
  }[];
}

export interface APIConfig {
  tool: string;
  displayName: string;
  plans: APIPlan[];
  annualDiscount: number;
  sourceUrl: string;
  verifiedDate: string;
}

export const OPENAI_API: APIConfig = {
  tool: "openai-api",
  displayName: "OpenAI API",
  annualDiscount: 0,
  sourceUrl: "https://openai.com/api/pricing",
  verifiedDate: "2026-01-15",
  plans: [
    {
      id: "payg",
      name: "Pay-as-you-go",
      priceMonthly: null,
      pricePerSeat: null,
      billing: "usage",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "Usage-based, current models: GPT-4o mini at $0.15/$0.60 per 1M tokens, GPT-4o at $2.50/$10.00",
      modelPricing: [
        { model: "gpt-4o", input: 2.5, output: 10.0 },
        { model: "gpt-4o-mini", input: 0.15, output: 0.60 },
        { model: "gpt-4-turbo", input: 10.0, output: 30.0 },
        { model: "gpt-3.5-turbo", input: 0.5, output: 1.5 },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 250,
      pricePerSeat: null,
      billing: "flat",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "$250/mo flat, includes 1M tokens of GPT-4o, reduced rates on others",
    },
    {
      id: "scale",
      name: "Scale",
      priceMonthly: null,
      pricePerSeat: null,
      billing: "custom",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "Custom volume pricing for high-volume applications",
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
      notes: "Volume discounts, dedicated support, SLA",
    },
  ],
};

export const ANTHROPIC_API: APIConfig = {
  tool: "anthropic-api",
  displayName: "Anthropic API",
  annualDiscount: 0,
  sourceUrl: "https://console.anthropic.com/api/pricing",
  verifiedDate: "2026-01-15",
  plans: [
    {
      id: "payg",
      name: "Pay-as-you-go",
      priceMonthly: null,
      pricePerSeat: null,
      billing: "usage",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "Usage-based: Claude 3.5 Sonnet at $3.00/$15.00 per 1M tokens",
      modelPricing: [
        { model: "claude-3-5-sonnet", input: 3.0, output: 15.0 },
        { model: "claude-3-opus", input: 15.0, output: 75.0 },
        { model: "claude-3-haiku", input: 0.25, output: 1.25 },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      priceMonthly: 100,
      pricePerSeat: null,
      billing: "flat",
      annualDiscount: 0,
      minSeats: 1,
      maxSeats: null,
      notes: "$100/mo flat, includes credits, reduced rates",
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
      notes: "Custom pricing, volume discounts, SLA, support",
    },
  ],
};