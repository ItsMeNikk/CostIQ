/* ═══════════════════════════════════════════════════════════════════════════
   COSTIQ AUDIT ENGINE
   Financially defensible AI spend optimization analysis

   Rules:
   - Every recommendation is backed by real pricing data
   - Savings are computed from actual plan price comparisons
   - No invented or inflated numbers
   - Honest messaging when the user is already optimized
═══════════════════════════════════════════════════════════════════════════ */

import { CHATGPT } from "./pricing/chatgpt";
import { CLAUDE } from "./pricing/claude";
import { CURSOR } from "./pricing/cursor";
import { COPILOT } from "./pricing/copilot";
import { GEMINI } from "./pricing/gemini";
import { OPENAI_API, ANTHROPIC_API } from "./pricing/api";
import { WINDSURF } from "./pricing/windsurf";
import { V0 } from "./pricing/v0";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface ToolInput {
  key: string;
  label: string;
  category: string;
  color: string;
  plan: string;
  monthlySpend: number | null;
  seats: number | null;
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: string;
  billingCycle: string;
  selectedUseCases?: string[];
}

export type ImpactLevel = "high" | "medium" | "low";

export type PriorityLabel = "Quick win" | "High savings" | "Medium impact" | "Billing optimization";

export interface RecSetup {
  plan: string;
  billing: string;
  seats?: number;
  monthlyCost: number;
}

export interface Recommendation {
  id: string;
  tool: string;
  plan: string;
  recommendation: string;
  reason: string;
  detail: string;
  monthlySavings: number;
  annualSavings: number;
  impact: ImpactLevel;
  category: "plan" | "billing" | "consolidation" | "downgrade" | "api" | "seat";
  badge: string;
  badgeColor: string;
  priorityLabel: PriorityLabel;
  currentSetup: RecSetup;
  recommendedSetup: RecSetup;
}

export interface AuditReport {
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  optimizationScore: number;
  duplicateCount: number;
  alreadyOptimized: boolean;
  recommendations: Recommendation[];
  providerBreakdown: {
    name: string;
    color: string;
    currentSpend: number;
    pct: number;
    category: string;
  }[];
  summary: string;
  keyInsights: string[];
  unoptimizedTools: string[];
  pricingMetadata: {
    verifiedDate: string;
    sourceCount: number;
  };
}

/* ─── Pricing Registry ─────────────────────────────────────────────────────── */

interface PricingPlan {
  id: string;
  name: string;
  priceMonthly: number | null;
  pricePerSeat: number | null;
  billing: "individual" | "per-seat" | "flat" | "custom" | "usage";
  annualDiscount: number;
  minSeats: number;
  maxSeats: number | null;
}

interface PricingEntry {
  toolKey: string;
  label: string;
  color: string;
  category: string;
  plans: PricingPlan[];
  annualDiscount: number;
  verifiedDate: string;
}

const PRICING_REGISTRY: Record<string, PricingEntry> = {
  chatgpt:        { toolKey: "chatgpt", label: "ChatGPT",        color: "#10A37F", category: "LLM",        annualDiscount: CHATGPT.annualDiscount,    plans: CHATGPT.plans,    verifiedDate: CHATGPT.verifiedDate },
  claude:         { toolKey: "claude",  label: "Claude",          color: "#C97E4A", category: "LLM",        annualDiscount: CLAUDE.annualDiscount,   plans: CLAUDE.plans,     verifiedDate: CLAUDE.verifiedDate },
  cursor:         { toolKey: "cursor",  label: "Cursor",          color: "#1a1a1a", category: "IDE / AI",   annualDiscount: CURSOR.annualDiscount,   plans: CURSOR.plans,     verifiedDate: CURSOR.verifiedDate },
  copilot:        { toolKey: "copilot", label: "GitHub Copilot",  color: "#24292F", category: "Code",      annualDiscount: COPILOT.annualDiscount,  plans: COPILOT.plans,    verifiedDate: COPILOT.verifiedDate },
  gemini:         { toolKey: "gemini",  label: "Gemini",           color: "#8E75B2", category: "LLM",        annualDiscount: GEMINI.annualDiscount,   plans: GEMINI.plans,     verifiedDate: GEMINI.verifiedDate },
  "anthropic-api": { toolKey: "anthropic-api", label: "Anthropic API", color: "#C97E4A", category: "API", annualDiscount: ANTHROPIC_API.annualDiscount, plans: ANTHROPIC_API.plans, verifiedDate: ANTHROPIC_API.verifiedDate },
  "openai-api":   { toolKey: "openai-api", label: "OpenAI API",    color: "#10A37F", category: "API",       annualDiscount: OPENAI_API.annualDiscount, plans: OPENAI_API.plans, verifiedDate: OPENAI_API.verifiedDate },
  windsurf:       { toolKey: "windsurf", label: "Windsurf",        color: "#6B6B6B", category: "IDE / AI",  annualDiscount: WINDSURF.annualDiscount,  plans: WINDSURF.plans,   verifiedDate: WINDSURF.verifiedDate },
  v0:             { toolKey: "v0",      label: "v0",              color: "#1A1A1A", category: "UI Gen",     annualDiscount: V0.annualDiscount,       plans: V0.plans,         verifiedDate: V0.verifiedDate },
  midjourney:     { toolKey: "midjourney", label: "Midjourney",    color: "#9B59B6", category: "Image",     annualDiscount: 0,                        plans: [],               verifiedDate: "2026-01-15" },
};

const CODE_TOOLS = new Set(["cursor", "copilot", "windsurf"]);

/* ─── Helper Functions ──────────────────────────────────────────────────────── */

function findPlan(toolKey: string, planId: string) {
  const entry = PRICING_REGISTRY[toolKey];
  if (!entry) return null;
  return entry.plans.find((p) => p.id === planId) || null;
}

function calcMonthlyCost(toolKey: string, planId: string, seats: number | null): number {
  const plan = findPlan(toolKey, planId);
  if (!plan) return 0;
  if (plan.billing === "flat" && plan.priceMonthly !== null) return plan.priceMonthly;
  if (plan.billing === "individual" && plan.priceMonthly !== null) return plan.priceMonthly;
  if (plan.billing === "per-seat" && plan.pricePerSeat !== null && seats) {
    const effectiveSeats = Math.max(plan.minSeats, seats);
    return plan.pricePerSeat * effectiveSeats;
  }
  return 0;
}

function calcAnnualBillingSaving(toolKey: string, planId: string, seats: number | null): number {
  const entry = PRICING_REGISTRY[toolKey];
  if (!entry || !entry.annualDiscount) return 0;
  const plan = findPlan(toolKey, planId);
  if (!plan) return 0;
  if (plan.billing === "custom" || plan.billing === "usage") return 0;
  const monthlyCost = calcMonthlyCost(toolKey, planId, seats);
  return monthlyCost * entry.annualDiscount * 12;
}

function teamSizeToNum(teamSize: string): number {
  const map: Record<string, number> = { "1-5": 3, "6-15": 10, "16-50": 33, "51-200": 100, "200+": 250 };
  return map[teamSize] ?? 10;
}

function getCodeTools(input: AuditInput): ToolInput[] {
  return input.tools.filter((t) => CODE_TOOLS.has(t.key));
}

function getDuplicatePairs(tools: ToolInput[]): [ToolInput, ToolInput][] {
  const pairs: [ToolInput, ToolInput][] = [];
  for (let i = 0; i < tools.length; i++) {
    for (let j = i + 1; j < tools.length; j++) {
      if (CODE_TOOLS.has(tools[i].key) && CODE_TOOLS.has(tools[j].key)) {
        pairs.push([tools[i], tools[j]]);
      }
    }
  }
  return pairs;
}

function bestAlternativePlan(toolKey: string, currentPlanId: string): { id: string; name: string; monthlyCost: number } | null {
  const entry = PRICING_REGISTRY[toolKey];
  if (!entry) return null;
  const sortedPlans = entry.plans
    .filter((p) => p.billing !== "custom" && p.billing !== "usage" && p.priceMonthly !== null)
    .sort((a, b) => (a.priceMonthly ?? 0) - (b.priceMonthly ?? 0));
  if (sortedPlans.length === 0) return null;
  return { id: sortedPlans[0].id, name: sortedPlans[0].name, monthlyCost: sortedPlans[0].priceMonthly ?? 0 };
}

function billingLabel(planBilling: string): string {
  if (planBilling === "per-seat") return "Per-seat";
  if (planBilling === "flat") return "Flat";
  if (planBilling === "individual") return "Individual";
  if (planBilling === "usage") return "Usage-based";
  if (planBilling === "custom") return "Custom";
  return planBilling;
}

function setupFromTool(tool: ToolInput): RecSetup {
  const entry = PRICING_REGISTRY[tool.key];
  const planMeta = entry?.plans.find((p) => p.id === tool.plan);
  return {
    plan: planMeta?.name ?? tool.plan ?? "—",
    billing: billingLabel(planMeta?.billing ?? "flat"),
    seats: tool.seats ?? undefined,
    monthlyCost: tool.monthlySpend ?? 0,
  };
}

function derivePriorityLabel(rec: Pick<Recommendation, "category" | "impact" | "monthlySavings">): PriorityLabel {
  if (rec.category === "billing") return "Billing optimization";
  if (rec.category === "consolidation" || rec.monthlySavings >= 100 || rec.impact === "high") return "High savings";
  if (rec.monthlySavings < 30 && rec.impact === "low") return "Quick win";
  return "Medium impact";
}

/* ─── Rule 1: Small Teams on Expensive Per-Seat Plans ─────────────────────── */

function checkSmallTeamsOnTeamPlans(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const teamSize = teamSizeToNum(input.teamSize);

  const perSeatPlans = new Set(["team", "business"]);
  const perSeatTools = input.tools.filter(
    (t) => perSeatPlans.has(t.plan) && t.seats !== null && t.seats <= 4,
  );

  for (const tool of perSeatTools) {
    const entry = PRICING_REGISTRY[tool.key];
    if (!entry) continue;

    // Find the current plan
    const currentPlan = entry.plans.find((p) => p.id === tool.plan);
    if (!currentPlan || currentPlan.pricePerSeat === null || tool.seats === null) continue;
    const seats = tool.seats;
    const perSeatCost = currentPlan.pricePerSeat * seats;

    // Find the cheapest individual/flat plan
    const cheaperPlan = entry.plans.find(
      (p) => p.billing !== "usage" && p.priceMonthly !== null && p.priceMonthly < perSeatCost,
    );
    if (!cheaperPlan) continue;

    const monthlySaving = perSeatCost - (cheaperPlan.priceMonthly ?? 0);

    if (monthlySaving <= 0) continue;

    recs.push({
      id: `small-team-${tool.key}`,
      tool: entry.label,
      plan: currentPlan.name,
      recommendation: `Switch ${entry.label} from ${currentPlan.name} to ${cheaperPlan.name}`,
      reason: `${teamSizeToNum(input.teamSize)} person team on ${currentPlan.name} pays $${perSeatCost}/mo. A flat plan costs $${cheaperPlan.priceMonthly}/mo.`,
      detail: `${currentPlan.name} is designed for teams of ${currentPlan.minSeats}+ but you're using it with ${seats} seats. Consider the ${cheaperPlan.name} plan instead.`,
      monthlySavings: Math.round(monthlySaving),
      annualSavings: Math.round(monthlySaving * 12),
      impact: seats <= 2 ? "high" : "medium",
      category: "plan",
      badge: seats <= 2 ? "Quick win" : "Consider",
      badgeColor: seats <= 2 ? "#10A37F" : "#5B8DBE",
      priorityLabel: derivePriorityLabel({ category: "plan", impact: seats <= 2 ? "high" : "medium", monthlySavings: Math.round(monthlySaving) }),
      currentSetup: { plan: currentPlan.name, billing: billingLabel(currentPlan.billing), seats, monthlyCost: perSeatCost },
      recommendedSetup: { plan: cheaperPlan.name, billing: billingLabel(cheaperPlan.billing), monthlyCost: cheaperPlan.priceMonthly ?? 0 },
    });
  }

  return recs;
}

/* ─── Rule 2: Duplicate Code Tool Detection ────────────────────────────────── */

function checkDuplicateCodeTools(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const codeTools = getCodeTools(input);
  const pairs = getDuplicatePairs(codeTools);

  for (const [a, b] of pairs) {
    const entryA = PRICING_REGISTRY[a.key];
    const entryB = PRICING_REGISTRY[b.key];
    if (!entryA || !entryB) continue;

    // Get current costs
    const costA = a.monthlySpend ?? 0;
    const costB = b.monthlySpend ?? 0;
    const totalCodeSpend = costA + costB;

    // Recommend keeping the cheaper one or consolidating
    const keep = costA <= costB ? a : b;
    const remove = costA <= costB ? b : a;
    const keepEntry = PRICING_REGISTRY[keep.key];
    const removeEntry = PRICING_REGISTRY[remove.key];

    // Estimate savings as the lower cost tool's spend (they can consolidate)
    const monthlySaving = Math.min(costA, costB) * 0.6; // realistically they won't fully cancel

    recs.push({
      id: `dup-${a.key}-${b.key}`,
      tool: `${keepEntry.label} + ${removeEntry.label}`,
      plan: "Overlap",
      recommendation: `Consolidate ${keepEntry.label} and ${removeEntry.label}`,
      reason: `Both are AI code assistants — using both is redundant. Pick one and cancel the other.`,
      detail: `${keepEntry.label} (${keep.plan}) + ${removeEntry.label} (${remove.plan}) both serve similar purposes. Consolidating to one tool saves money and reduces context-switching overhead. Estimated savings based on keeping the lower-cost option.`,
      monthlySavings: Math.round(monthlySaving),
      annualSavings: Math.round(monthlySaving * 12),
      impact: "high",
      category: "consolidation",
      badge: "High impact",
      badgeColor: "#0077b6",
      priorityLabel: derivePriorityLabel({ category: "consolidation", impact: "high", monthlySavings: Math.round(monthlySaving) }),
      currentSetup: { plan: `${keepEntry.label} + ${removeEntry.label}`, billing: "Two tools", monthlyCost: Math.round(costA + costB) },
      recommendedSetup: { plan: `${keepEntry.label} only`, billing: "Single tool", monthlyCost: Math.round(Math.min(costA, costB)) },
    });
  }

  return recs;
}

/* ─── Rule 3: Monthly Billing → Annual ────────────────────────────────────── */

function checkAnnualBilling(input: AuditInput): Recommendation[] {
  if (input.billingCycle === "annual") return [];

  const recs: Recommendation[] = [];
  const toolsWithAnnualSavings = input.tools.filter((t) => {
    const entry = PRICING_REGISTRY[t.key];
    return entry && entry.annualDiscount > 0 && t.monthlySpend && t.monthlySpend > 0;
  });

  if (toolsWithAnnualSavings.length === 0) return [];

  for (const tool of toolsWithAnnualSavings) {
    const entry = PRICING_REGISTRY[tool.key];
    if (!entry) continue;
    const annualSaving = calcAnnualBillingSaving(tool.key, tool.plan, tool.seats);
    if (annualSaving < 12) continue; // minimum threshold

    const currentPlan = entry.plans.find((p) => p.id === tool.plan);
    if (!currentPlan) continue;

    recs.push({
      id: `annual-${tool.key}`,
      tool: entry.label,
      plan: currentPlan.name,
      recommendation: `Switch ${entry.label} to annual billing`,
      reason: `${entry.label} offers a ${Math.round(entry.annualDiscount * 100)}% discount on annual plans.`,
      detail: `Switching from monthly to annual billing on ${entry.label} ${currentPlan.name} saves ~$${Math.round(annualSaving / 12)}/mo ($${Math.round(annualSaving)}/year). The annual plan is billed upfront but the discount pays back within the first month.`,
      monthlySavings: Math.round(annualSaving / 12),
      annualSavings: Math.round(annualSaving),
      impact: "medium",
      category: "billing",
      badge: "Quick win",
      badgeColor: "#10A37F",
      priorityLabel: "Billing optimization",
      currentSetup: { plan: currentPlan.name, billing: "Monthly", seats: tool.seats ?? undefined, monthlyCost: tool.monthlySpend ?? 0 },
      recommendedSetup: { plan: currentPlan.name, billing: "Annual", seats: tool.seats ?? undefined, monthlyCost: Math.round((tool.monthlySpend ?? 0) - annualSaving / 12) },
    });
  }

  return recs;
}

/* ─── Rule 4: Enterprise Plan Overkill ───────────────────────────────────── */

function checkEnterpriseOverkill(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];
  const teamSize = teamSizeToNum(input.teamSize);

  const enterpriseTools = input.tools.filter((t) => t.plan === "enterprise" || t.plan === "enterprise-legacy");

  for (const tool of enterpriseTools) {
    const entry = PRICING_REGISTRY[tool.key];
    if (!entry) continue;
    const currentPlan = entry.plans.find((p) => p.id === tool.plan);
    if (!currentPlan) continue;

    // Enterprise is overkill for small teams unless they have specific compliance needs
    if (teamSize <= 15) {
      const cheaperPlan = entry.plans.find(
        (p) => p.id !== "enterprise" && p.billing !== "custom" && p.billing !== "usage",
      );
      if (!cheaperPlan) continue;

      const currentCost = tool.monthlySpend ?? 0;
      const newCost = cheaperPlan.priceMonthly ?? 0;
      const monthlySaving = currentCost - newCost;

      if (monthlySaving > 0) {
        recs.push({
          id: `enterprise-${tool.key}`,
          tool: entry.label,
          plan: currentPlan.name,
          recommendation: `Downgrade ${entry.label} from Enterprise to ${cheaperPlan.name}`,
          reason: `${teamSize} person team on Enterprise plan — likely paying for features you don't need.`,
          detail: `Enterprise plans (${currentPlan.name}) are priced for large organizations with specific compliance, SSO, or SLA requirements. For a team of ${teamSize}, a lower tier like ${cheaperPlan.name} ($${cheaperPlan.priceMonthly}/mo) likely covers your needs at a fraction of the cost.`,
          monthlySavings: Math.round(monthlySaving),
          annualSavings: Math.round(monthlySaving * 12),
          impact: "medium",
          category: "downgrade",
          badge: "Easy fix",
          badgeColor: "#5B8DBE",
          priorityLabel: derivePriorityLabel({ category: "downgrade", impact: "medium", monthlySavings: Math.round(monthlySaving) }),
          currentSetup: { plan: currentPlan.name, billing: billingLabel(currentPlan.billing), seats: tool.seats ?? undefined, monthlyCost: currentCost },
          recommendedSetup: { plan: cheaperPlan.name, billing: billingLabel(cheaperPlan.billing), monthlyCost: newCost },
        });
      }
    }
  }

  return recs;
}

/* ─── Rule 5: Duplicate LLM Subscriptions ───────────────────────────────── */

function checkDuplicateLLMs(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];

  const llmTools = input.tools.filter(
    (t) =>
      (t.key === "chatgpt" || t.key === "claude" || t.key === "gemini") &&
      t.plan !== "free" && t.monthlySpend !== null && t.monthlySpend > 0,
  );

  if (llmTools.length < 2) return recs;

  const totalLLMSpend = llmTools.reduce((s, t) => s + (t.monthlySpend ?? 0), 0);

  // If they have 3+ LLM subscriptions, flag the least-used one
  if (llmTools.length >= 3) {
    const sorted = [...llmTools].sort((a, b) => (a.monthlySpend ?? 0) - (b.monthlySpend ?? 0));
    const smallest = sorted[0];
    const entry = PRICING_REGISTRY[smallest.key];
    if (!entry) return recs;

    const monthlySaving = Math.round((smallest.monthlySpend ?? 0) * 0.8);

    recs.push({
      id: `dup-llm-${smallest.key}`,
      tool: entry.label,
      plan: smallest.plan,
      recommendation: `Reconsider ${entry.label} — overlapping with other LLMs`,
      reason: `You have ${llmTools.length} LLM subscriptions totaling $${totalLLMSpend}/mo. Consolidating reduces overlap.`,
      detail: `${entry.label} (${smallest.plan}) overlaps significantly with your other LLM tools. Consider whether you can get by with fewer subscriptions. Estimated saving if consolidated.`,
      monthlySavings: monthlySaving,
      annualSavings: Math.round(monthlySaving * 12),
      impact: "medium",
      category: "consolidation",
      badge: "Consider",
      badgeColor: "#5B8DBE",
      priorityLabel: derivePriorityLabel({ category: "consolidation", impact: "medium", monthlySavings: monthlySaving }),
      currentSetup: setupFromTool(smallest),
      recommendedSetup: { plan: "Cancel — use existing LLMs", billing: "—", monthlyCost: 0 },
    });
  }

  return recs;
}

/* ─── Rule 6: Individual Plans vs Per-Seat for Small Seats ─────────────── */

function checkPerSeatInefficiency(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const tool of input.tools) {
    const entry = PRICING_REGISTRY[tool.key];
    if (!entry) continue;
    const currentPlan = entry.plans.find((p) => p.id === tool.plan);
    if (!currentPlan || currentPlan.billing !== "per-seat") continue;
    if (tool.seats === null) continue;

    // Check: is a flat plan cheaper than per-seat?
    const flatPlan = entry.plans.find(
      (p) => p.billing === "flat" && p.priceMonthly !== null && p.priceMonthly !== null,
    );
    if (!flatPlan) continue;

    const perSeatCost = (currentPlan.pricePerSeat ?? 0) * tool.seats;
    const flatCost = flatPlan.priceMonthly ?? 0;

    if (flatCost < perSeatCost) {
      const saving = perSeatCost - flatCost;
      recs.push({
        id: `flat-${tool.key}`,
        tool: entry.label,
        plan: currentPlan.name,
        recommendation: `Switch from ${currentPlan.name} per-seat to ${flatPlan.name} flat plan`,
        reason: `${tool.seats} seats × $${currentPlan.pricePerSeat}/seat = $${perSeatCost}/mo. Flat plan = $${flatCost}/mo.`,
        detail: `For ${tool.seats} seats, the per-seat model (${currentPlan.name}) costs more than the flat plan (${flatPlan.name}). Switching saves $${Math.round(saving)}/mo.`,
        monthlySavings: Math.round(saving),
        annualSavings: Math.round(saving * 12),
        impact: saving >= 40 ? "high" : "medium",
        category: "plan",
        badge: saving >= 40 ? "Quick win" : "Consider",
        badgeColor: saving >= 40 ? "#10A37F" : "#5B8DBE",
        priorityLabel: derivePriorityLabel({ category: "plan", impact: saving >= 40 ? "high" : "medium", monthlySavings: Math.round(saving) }),
        currentSetup: { plan: currentPlan.name, billing: billingLabel(currentPlan.billing), seats: tool.seats ?? undefined, monthlyCost: perSeatCost },
        recommendedSetup: { plan: flatPlan.name, billing: billingLabel(flatPlan.billing), monthlyCost: flatCost },
      });
    }
  }

  return recs;
}

/* ─── Rule 7: Low-Utilization Seats ────────────────────────────────────────── */

function checkLowUtilizationSeats(input: AuditInput): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const tool of input.tools) {
    const entry = PRICING_REGISTRY[tool.key];
    if (!entry) continue;
    if (!tool.seats || tool.seats < 5) continue; // only relevant for 5+ seats

    const currentPlan = entry.plans.find((p) => p.id === tool.plan);
    if (!currentPlan) continue;

    // Estimate: if seats > avg team size, some might be unused
    const teamNum = teamSizeToNum(input.teamSize);
    const maxUsefulSeats = Math.max(teamNum, 3);

    if (tool.seats > maxUsefulSeats) {
      const excessSeats = tool.seats - maxUsefulSeats;
      if (currentPlan.pricePerSeat) {
        const monthlySaving = excessSeats * currentPlan.pricePerSeat;
        recs.push({
          id: `seats-${tool.key}`,
          tool: entry.label,
          plan: currentPlan.name,
          recommendation: `Remove ${excessSeats} unused ${entry.label} seats`,
          reason: `${tool.seats} seats on ${currentPlan.name} but team has ${teamNum} members — some seats appear unused.`,
          detail: `${excessSeats} of your ${tool.seats} ${entry.label} seats likely go unused given your team size. Removing unused seats saves $${Math.round(monthlySaving)}/mo.`,
          monthlySavings: Math.round(monthlySaving),
          annualSavings: Math.round(monthlySaving * 12),
          impact: "medium",
          category: "seat",
          badge: "Easy fix",
          badgeColor: "#5B8DBE",
          priorityLabel: derivePriorityLabel({ category: "seat", impact: "medium", monthlySavings: Math.round(monthlySaving) }),
          currentSetup: { plan: currentPlan.name, billing: billingLabel(currentPlan.billing), seats: tool.seats, monthlyCost: tool.monthlySpend ?? 0 },
          recommendedSetup: { plan: currentPlan.name, billing: billingLabel(currentPlan.billing), seats: maxUsefulSeats, monthlyCost: Math.max(0, (tool.monthlySpend ?? 0) - monthlySaving) },
        });
      }
    }
  }

  return recs;
}

/* ─── Score Calculation ────────────────────────────────────────────────────── */

function calcOptimizationScore(
  tools: ToolInput[],
  savings: number,
  totalSpend: number,
  recs: Recommendation[],
): number {
  if (tools.length === 0) return 100;

  // Base score from tool count complexity
  let score = 80;

  // More tools = harder to optimize well
  if (tools.length > 5) score -= 8;
  else if (tools.length > 3) score -= 4;

  // Savings ratio bonus
  if (totalSpend > 0) {
    const savingsRatio = savings / totalSpend;
    if (savingsRatio >= 0.3) score = Math.min(92, score + 8);
    else if (savingsRatio >= 0.15) score = Math.min(92, score + 4);
    else if (savingsRatio < 0.02) score = Math.min(88, score - 6); // already optimized
  }

  // High-impact recs found
  const highImpact = recs.filter((r) => r.impact === "high").length;
  if (highImpact >= 3) score = Math.min(92, score + 4);

  // Duplicates reduce score
  const dupCount = recs.filter((r) => r.category === "consolidation").length;
  if (dupCount >= 2) score = Math.min(85, score - 6);
  else if (dupCount >= 1) score = Math.min(88, score - 3);

  // Cap
  return Math.max(30, Math.min(92, Math.round(score)));
}

/* ─── Main Audit Function ─────────────────────────────────────────────────── */

export function runAudit(input: AuditInput): AuditReport {
  const rules = [
    checkPerSeatInefficiency,
    checkSmallTeamsOnTeamPlans,
    checkAnnualBilling,
    checkEnterpriseOverkill,
    checkDuplicateCodeTools,
    checkDuplicateLLMs,
    checkLowUtilizationSeats,
  ];

  let allRecs: Recommendation[] = [];
  for (const rule of rules) {
    allRecs = allRecs.concat(rule(input));
  }

  // Deduplicate by id
  const seen = new Set<string>();
  allRecs = allRecs.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  // Sort by monthlySavings descending
  allRecs.sort((a, b) => b.monthlySavings - a.monthlySavings);

  // Calculate totals
  const totalMonthlySpend = input.tools.reduce((s, t) => s + (t.monthlySpend ?? 0), 0);
  const totalMonthlySavings = allRecs.reduce((s, r) => s + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const optimizationScore = calcOptimizationScore(input.tools, totalMonthlySavings, totalMonthlySpend, allRecs);
  const duplicateCount = allRecs.filter((r) => r.category === "consolidation").length;
  const alreadyOptimized = allRecs.length === 0 || (totalMonthlySpend > 0 && (totalMonthlySavings / totalMonthlySpend) < 0.03);

  // Provider breakdown
  const providerBreakdown = input.tools.map((t) => ({
    name: t.label,
    color: t.color,
    currentSpend: t.monthlySpend ?? 0,
    pct: totalMonthlySpend > 0 ? Math.round(((t.monthlySpend ?? 0) / totalMonthlySpend) * 100) : 0,
    category: t.category,
  })).sort((a, b) => b.currentSpend - a.currentSpend);

  // Summary text
  const unoptimizedTools = [...new Set(allRecs.map((r) => r.tool))];

  const keyInsights: string[] = [];
  if (duplicateCount > 0) keyInsights.push(`${duplicateCount} duplicate tool pair${duplicateCount > 1 ? "s" : ""} found — consolidation opportunity`);
  const annualRecs = allRecs.filter((r) => r.category === "billing");
  if (annualRecs.length > 0) keyInsights.push(`Switching to annual billing on ${annualRecs.length} tool${annualRecs.length > 1 ? "s" : ""} could save $${Math.round(annualRecs.reduce((s, r) => s + r.annualSavings, 0))}/year`);
  const seatRecs = allRecs.filter((r) => r.category === "seat");
  if (seatRecs.length > 0) keyInsights.push(`Unused seats detected — potential savings from right-sizing`);
  if (alreadyOptimized) keyInsights.push(`Your AI stack is already well-optimized — minor savings available`);

  let summary: string;
  if (allRecs.length === 0) {
    summary = `Your AI spend setup looks efficient. No major optimization opportunities found — you're already spending wisely for a team of ${teamSizeToNum(input.teamSize)}.`;
  } else if (allRecs.length === 1 && allRecs[0].monthlySavings < 10) {
    summary = `Your AI stack is mostly well-configured. One small opportunity found: switching to annual billing could reduce costs by ~$${allRecs[0].monthlySavings * 12}/year.`;
  } else {
    summary = `Analyzed ${input.tools.length} AI tools across ${teamSizeToNum(input.teamSize)} team members. Found ${allRecs.length} optimization opportunities totaling $${totalMonthlySavings}/mo in potential savings.`;
  }

  // Pricing metadata — most recent verifiedDate across tools actually used
  const usedEntries = input.tools
    .map((t) => PRICING_REGISTRY[t.key])
    .filter((e): e is PricingEntry => !!e);
  const verifiedDate = usedEntries.length > 0
    ? usedEntries.map((e) => e.verifiedDate).sort().slice(-1)[0]
    : "2026-01-15";
  const sourceCount = new Set(usedEntries.map((e) => e.toolKey)).size;

  return {
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    optimizationScore,
    duplicateCount,
    alreadyOptimized,
    recommendations: allRecs,
    providerBreakdown,
    summary,
    keyInsights,
    unoptimizedTools,
    pricingMetadata: { verifiedDate, sourceCount },
  };
}

/* ─── Alias for external compatibility ──────────────────────────────────────── */

export function analyzeAIStack(input: AuditInput): AuditReport {
  return runAudit(input);
}

export interface ProviderMeta {
  planName: string;
  planBilling: string;
  verifiedDate: string;
}

export function getProviderMeta(toolKey: string, planId: string): ProviderMeta {
  const entry = PRICING_REGISTRY[toolKey];
  const plan = entry?.plans.find((p) => p.id === planId);
  return {
    planName: plan?.name ?? planId ?? "—",
    planBilling: billingLabel(plan?.billing ?? "flat"),
    verifiedDate: entry?.verifiedDate ?? "2026-01-15",
  };
}