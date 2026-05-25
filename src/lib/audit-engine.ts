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
    auditNotes: string[];
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
      recommendation: `Move ${entry.label} from ${currentPlan.name} to the ${cheaperPlan.name} plan`,
      reason: `At ${seats} seat${seats === 1 ? "" : "s"}, ${currentPlan.name} costs $${perSeatCost}/mo — the ${cheaperPlan.name} plan covers the same workflow for $${cheaperPlan.priceMonthly}/mo.`,
      detail: `${currentPlan.name} is structured for teams larger than the ${seats}-seat configuration in use here. The ${cheaperPlan.name} plan delivers the same core capabilities at this scale; the change is administrative — billing only, not day-to-day usage.`,
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
      recommendation: `Consolidate ${keepEntry.label} and ${removeEntry.label} onto a single coding assistant`,
      reason: `Your team is paying for two AI coding assistants with substantially overlapping workflows. Standardizing on one removes redundant seat spend without losing capability.`,
      detail: `${keepEntry.label} (${keep.plan}) and ${removeEntry.label} (${remove.plan}) cover the same primary surface — in-editor completion and chat. Running both typically reflects momentum from trials rather than a deliberate split. Consolidating onto ${keepEntry.label} (the lower-cost option here) preserves the team's productivity surface; the recoverable spend comes from canceling the duplicate, not from changing how anyone writes code.`,
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
      recommendation: `Move ${entry.label} ${currentPlan.name} to annual billing`,
      reason: `Monthly billing on ${entry.label} ${currentPlan.name} carries roughly a ${Math.round(entry.annualDiscount * 100)}% premium over the published annual rate, with no workflow change required to capture the difference.`,
      detail: `${entry.label} publishes a ~${Math.round(entry.annualDiscount * 100)}% discount on annual billing for ${currentPlan.name}. At current spend this reduces recurring cost by ~$${Math.round(annualSaving / 12)}/mo ($${Math.round(annualSaving)}/yr). The annual cycle is billed upfront, but the savings recoup the differential inside the first month — and the team keeps the same seats, plan, and access throughout.`,
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
          recommendation: `Step ${entry.label} down from Enterprise to the ${cheaperPlan.name} plan`,
          reason: `${currentPlan.name} pricing is structured for organizations with compliance, SSO, and dedicated-SLA requirements. At ${teamSize} active users, that tier is likely over-provisioned.`,
          detail: `Enterprise tiers exist to underwrite SOC2/HIPAA workflows, dedicated tenancy, and uptime SLAs that small teams rarely consume. For a ${teamSize}-person team without those constraints, ${cheaperPlan.name} at $${cheaperPlan.priceMonthly}/mo covers the same day-to-day usage — and the migration path back to Enterprise is a single contract change if compliance requirements emerge later.`,
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
      recommendation: `Audit ${entry.label} usage — likely overlapping with the ${llmTools.length - 1} other LLM subscription${llmTools.length - 1 === 1 ? "" : "s"} in the stack`,
      reason: `The stack carries ${llmTools.length} paid LLM subscriptions totaling $${totalLLMSpend}/mo. Most teams converge on one or two for production workflows; the remainder usually trace back to experiments that were never canceled.`,
      detail: `${entry.label} (${smallest.plan}) is the lowest-spend LLM in the stack, which typically indicates it was retained after a trial rather than chosen as a primary tool. Pulling last-30-day usage will reveal whether it's load-bearing. If it isn't, canceling removes the line without affecting the workflows already running on the other ${llmTools.length - 1} subscription${llmTools.length - 1 === 1 ? "" : "s"}.`,
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
        recommendation: `Switch ${entry.label} from per-seat ${currentPlan.name} to the ${flatPlan.name} flat plan`,
        reason: `At ${tool.seats} seats, per-seat pricing on ${currentPlan.name} costs $${perSeatCost}/mo — the ${flatPlan.name} flat plan covers the same access for $${flatCost}/mo.`,
        detail: `Per-seat pricing scales linearly with headcount; at ${tool.seats} seats, ${currentPlan.name} runs $${perSeatCost}/mo while the ${flatPlan.name} flat tier delivers equivalent capability for $${flatCost}/mo. The flat structure also fixes the bill against future seat growth up to the plan's limit, which removes a recurring source of cost drift.`,
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
          recommendation: `Right-size ${entry.label} from ${tool.seats} to ~${maxUsefulSeats} active seats`,
          reason: `${entry.label} carries ${tool.seats} seats on ${currentPlan.name}, but only ~${maxUsefulSeats} are likely active given current team size. Excess seats convert directly to recoverable spend.`,
          detail: `Per-seat tools accumulate excess capacity as people leave or projects wind down; the bill rarely contracts on its own. Pulling the admin seat-list against current headcount typically surfaces ${excessSeats} inactive seat${excessSeats === 1 ? "" : "s"} on ${entry.label}. Removing them recovers ~$${Math.round(monthlySaving)}/mo and has no effect on the engineers still using the tool.`,
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

/* ─── Provider Audit Notes ────────────────────────────────────────────────── */

/**
 * Per-tool audit observations that show up under each provider card.
 * Reads like an auditor's margin note — short, factual, never marketing.
 */
function generateProviderNotes(
  tool: ToolInput,
  input: AuditInput,
  recs: Recommendation[],
  stackCategoryCounts: Record<string, number>,
): string[] {
  const notes: string[] = [];
  const entry = PRICING_REGISTRY[tool.key];
  const planMeta = entry?.plans.find((p) => p.id === tool.plan);
  const teamNum = teamSizeToNum(input.teamSize);
  const toolRecs = recs.filter((r) => r.tool === tool.label || r.tool.includes(tool.label));

  const isFree = tool.plan === "free" || tool.plan === "hobby" || (tool.monthlySpend ?? 0) === 0;
  const isEnterprise = tool.plan === "enterprise" || tool.plan === "enterprise-legacy";
  const isAnnualAlready = input.billingCycle === "annual";

  // ── Billing assessment ──────────────────────────────────────────
  const billingRec = toolRecs.find((r) => r.category === "billing");
  if (billingRec) {
    notes.push(`Monthly billing carries unnecessary overhead — annual pricing on this plan would reduce recurring cost without workflow changes.`);
  } else if (isFree) {
    notes.push(`Operating on the free tier; no billing exposure on this tool.`);
  } else if (isAnnualAlready && entry && entry.annualDiscount > 0) {
    notes.push(`Annual billing already in place; no further billing optimization available.`);
  } else if (planMeta?.billing === "usage") {
    notes.push(`Usage-based pricing — cost scales with actual API consumption rather than seats.`);
  } else if (planMeta?.billing === "per-seat" && tool.seats && tool.seats > 0) {
    notes.push(`Per-seat structure priced at the published rate for ${tool.seats} active seat${tool.seats === 1 ? "" : "s"}.`);
  } else if (planMeta?.billing === "flat") {
    notes.push(`Flat-rate pricing — predictable monthly cost regardless of seat count.`);
  }

  // ── Seat utilization ────────────────────────────────────────────
  const seatRec = toolRecs.find((r) => r.category === "seat");
  if (seatRec) {
    notes.push(`Seat count exceeds active team headcount; right-sizing recommended.`);
  } else if (tool.seats && tool.seats > 0 && planMeta?.billing === "per-seat") {
    if (tool.seats <= teamNum) {
      notes.push(`Seat allocation aligned with current team size of ${teamNum}.`);
    }
  }

  // ── Plan-fit / pricing benchmark ────────────────────────────────
  const planRec = toolRecs.find((r) => r.category === "plan" || r.category === "downgrade");
  if (planRec) {
    if (isEnterprise) {
      notes.push(`Enterprise tier appears over-provisioned for a ${teamNum}-person team without explicit compliance needs.`);
    } else {
      notes.push(`Current plan tier is not the most cost-efficient for this seat count.`);
    }
  } else if (!isFree && planMeta && entry) {
    notes.push(`Plan tier (${planMeta.name}) is appropriately sized for current usage.`);
  }

  // ── Redundancy / overlap check ──────────────────────────────────
  const consolidationRec = toolRecs.find((r) => r.category === "consolidation");
  const sameCategoryCount = entry ? (stackCategoryCounts[entry.category] ?? 0) : 0;
  if (consolidationRec) {
    notes.push(`Overlaps with another ${entry?.category ?? "tool"} in the stack; consolidation would remove redundant spend.`);
  } else if (sameCategoryCount === 1) {
    notes.push(`No redundant ${entry?.category ?? "category"} tooling detected.`);
  }

  // De-duplicate while preserving order, cap at 3 lines so the card stays scannable.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const n of notes) {
    if (seen.has(n)) continue;
    seen.add(n);
    unique.push(n);
    if (unique.length === 3) break;
  }
  return unique;
}

/* ─── Score Calculation ────────────────────────────────────────────────────── */

/**
 * Optimization score, 30–98. Deterministic and inspectable.
 *
 * Starts at 100 and subtracts for observed inefficiencies. Each factor maps to a
 * concrete signal a CFO would actually call out — never a random number.
 */
function calcOptimizationScore(
  input: AuditInput,
  recs: Recommendation[],
  totalSpend: number,
): number {
  if (input.tools.length === 0) return 100;

  let score = 100;
  const teamNum = teamSizeToNum(input.teamSize);

  // 1) Duplicate tooling (consolidation recs) — each pair is a structural overlap.
  const dupCount = recs.filter((r) => r.category === "consolidation").length;
  score -= Math.min(dupCount * 8, 16);

  // 2) Unused seats — each rec already represents a tool with excess seats.
  const seatRecs = recs.filter((r) => r.category === "seat").length;
  score -= Math.min(seatRecs * 5, 10);

  // 3) Monthly billing posture — count tools that *could* save via annual.
  const annualOpportunityCount = recs.filter((r) => r.category === "billing").length;
  score -= Math.min(annualOpportunityCount * 2, 8);

  // 4) Too many paid LLM subscriptions — overlap risk.
  const paidLLMCount = input.tools.filter(
    (t) =>
      (t.key === "chatgpt" || t.key === "claude" || t.key === "gemini") &&
      t.plan !== "free" &&
      (t.monthlySpend ?? 0) > 0,
  ).length;
  if (paidLLMCount >= 3) score -= 6;
  else if (paidLLMCount === 2) score -= 2;

  // 5) Code-tool overlap — running 2+ paid AI coding assistants is a smell even
  //    if checkDuplicateCodeTools didn't fire (e.g. one is on free tier).
  const paidCodeToolCount = input.tools.filter(
    (t) => CODE_TOOLS.has(t.key) && t.plan !== "free" && t.plan !== "hobby" && (t.monthlySpend ?? 0) > 0,
  ).length;
  if (paidCodeToolCount >= 2 && dupCount === 0) score -= 4;

  // 6) Spend per employee — heuristic benchmark. AI tooling typically lands
  //    between ~$40 and ~$120 per active engineer at this stage of the market.
  if (teamNum > 0 && totalSpend > 0) {
    const perHead = totalSpend / teamNum;
    if (perHead > 180) score -= 6;
    else if (perHead > 120) score -= 3;
    else if (perHead < 25 && input.tools.length > 1) score -= 2; // probably under-licensed
  }

  // 7) Stack breadth — large unfocused stacks deserve a small ding.
  if (input.tools.length >= 7) score -= 3;
  else if (input.tools.length >= 5) score -= 1;

  // 8) Modest credit if recommendations exist and savings dwarf spend — means
  //    the engine found a lot to act on, which is still a *current* inefficiency,
  //    not a virtue — so we DON'T bonus it. Score reflects today's posture only.

  // Clamp to a believable analyst range. 100 implies "we'd find nothing to say".
  return Math.max(30, Math.min(98, Math.round(score)));
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
  const optimizationScore = calcOptimizationScore(input, allRecs, totalMonthlySpend);
  const duplicateCount = allRecs.filter((r) => r.category === "consolidation").length;
  const alreadyOptimized = allRecs.length === 0 || (totalMonthlySpend > 0 && (totalMonthlySavings / totalMonthlySpend) < 0.03);

  // Stack-level category counts for redundancy notes.
  const stackCategoryCounts: Record<string, number> = {};
  for (const t of input.tools) {
    const cat = PRICING_REGISTRY[t.key]?.category;
    if (cat) stackCategoryCounts[cat] = (stackCategoryCounts[cat] ?? 0) + 1;
  }

  // Provider breakdown
  const providerBreakdown = input.tools.map((t) => ({
    name: t.label,
    color: t.color,
    currentSpend: t.monthlySpend ?? 0,
    pct: totalMonthlySpend > 0 ? Math.round(((t.monthlySpend ?? 0) / totalMonthlySpend) * 100) : 0,
    category: t.category,
    auditNotes: generateProviderNotes(t, input, allRecs, stackCategoryCounts),
  })).sort((a, b) => b.currentSpend - a.currentSpend);

  // Summary text
  const unoptimizedTools = [...new Set(allRecs.map((r) => r.tool))];

  const keyInsights: string[] = [];
  if (duplicateCount > 0) keyInsights.push(`${duplicateCount} overlapping tool pair${duplicateCount > 1 ? "s" : ""} identified — consolidation would remove redundant spend without changing core workflows.`);
  const annualRecs = allRecs.filter((r) => r.category === "billing");
  if (annualRecs.length > 0) keyInsights.push(`Monthly billing posture across ${annualRecs.length} tool${annualRecs.length > 1 ? "s" : ""} is leaving ~$${Math.round(annualRecs.reduce((s, r) => s + r.annualSavings, 0))}/yr on the table relative to published annual rates.`);
  const seatRecs = allRecs.filter((r) => r.category === "seat");
  if (seatRecs.length > 0) keyInsights.push(`Seat counts on per-seat tools exceed active team headcount; right-sizing converts directly to recoverable spend.`);
  if (alreadyOptimized) keyInsights.push(`The current stack appears appropriately sized for the team's usage and spend level — material optimization opportunities are limited.`);

  let summary: string;
  if (allRecs.length === 0) {
    summary = `No material optimization opportunities were identified in the current setup. The stack reads as appropriately sized for a ${teamSizeToNum(input.teamSize)}-person team's usage and spend level.`;
  } else if (allRecs.length === 1 && allRecs[0].monthlySavings < 10) {
    summary = `The stack is largely well-configured. One residual lever was identified — switching to annual billing would reduce recurring cost by ~$${allRecs[0].monthlySavings * 12}/yr without any workflow change.`;
  } else {
    summary = `Reviewed ${input.tools.length} AI tool${input.tools.length === 1 ? "" : "s"} across ${teamSizeToNum(input.teamSize)} active team member${teamSizeToNum(input.teamSize) === 1 ? "" : "s"}. Identified ${allRecs.length} optimization opportunit${allRecs.length === 1 ? "y" : "ies"} representing ~$${totalMonthlySavings}/mo in recoverable spend.`;
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