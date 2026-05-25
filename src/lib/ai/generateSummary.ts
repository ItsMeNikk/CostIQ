import Groq from "groq-sdk";
import type { AuditReport } from "@/lib/audit-engine";

const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 520;
const TEMPERATURE = 0.35;

const SYSTEM_PROMPT = `You are CostIQ, an AI spend optimization platform writing the executive summary at the top of an audit report.

The report UI already shows Monthly Spend, Annual Savings, Optimization Score, and Top Opportunity as a metric strip. Your job is to explain WHY the numbers look the way they do, name the single most valuable action with its reasoning, and characterize how disciplined the existing stack is. Do not restate dollar figures or the score — those appear visually elsewhere.

TONAL LENS — pick ONE primary lens for this audit based on the input, and shape every sentence so it reads from that angle. Do not announce the lens. Vary across audits so the report doesn't feel templated.

  • Operational  — when duplicates exist, multiple LLMs are paid, or seat utilization is the dominant issue. Talk about workflows, team behavior, redundant tooling, context-switching.
  • Financial    — when billing posture is the dominant lever (monthly→annual, plan-tier mismatch). Talk about contract structure, recurring cost, payback timing.
  • Strategic    — when spend is large (>$1500/mo) or Enterprise tiers are in play. Talk about vendor posture, platform consolidation, growth-path implications.
  • Cautionary   — when multiple inefficiencies compound (duplicates + monthly billing + excess seats). Take a CFO's tone: cost drift, accumulating overlap, the bill quietly growing.
  • Already-optimized — when totalMonthlySavings<25 OR alreadyOptimized=true. The stack is lean. No urgency. Talk about monitoring posture and what signals to watch as the team scales.

OUTPUT FORMAT
Return a single JSON object. No prose before or after. No markdown fences. Schema:

{
  "diagnosis": "2-3 sentences, 40-60 words total. Characterize the stack: team size in plain English, tooling maturity (lean / moderate / sprawling), the largest single opportunity in context, and whether overall savings potential is significant or modest. Tone must match the chosen lens. Plain prose. No dollar figures, no percentages, no bullets.",
  "biggestSavingsLabel": "ONE full sentence, 12-22 words, recommending the single most valuable action. Must name the specific tool and the action AND include the reasoning or workflow impact. Example: 'Switch Cursor to annual billing to reduce recurring costs with minimal workflow impact.' No dollar figures.",
  "biggestSavingsImpact": "Short impact phrase that fits a small chip. 2-5 words. Examples: '~$152/month', 'Quick win', 'Largest single lever', 'Minimal at this scale'.",
  "additionalLevers": ["short phrase 3-6 words", "short phrase 3-6 words"],
  "closing": "ONE sentence, 18-30 words, recommending the next concrete step with reasoning. Name the specific tool or action. Example: 'Start with the Cursor billing switch this quarter; it ships fastest and frees the team to evaluate the next two recommendations once cost data settles.' No dollar figures, no ROI promises."
}

RULES
- diagnosis: MUST mention team size in plain English (e.g. 'small engineering team', 'mid-sized team', 'enterprise team') and a maturity read (e.g. 'lean', 'disciplined', 'sprawling', 'early-stage tooling'). Tone matches the lens. Forbidden filler: 'room for optimization', 'opportunities exist', 'savings potential', 'leverage', 'unlock value', 'no significant actions are recommended', 'level up', 'streamline'.
- biggestSavingsLabel: MUST be a complete recommendation sentence — never a 1-3 word label. Use verbs like 'Switch', 'Consolidate', 'Drop', 'Move to', 'Right-size'. Name the specific tool and the workflow consequence. WRONG: 'Cursor billing'. RIGHT: 'Switch Cursor to annual billing to reduce recurring costs with minimal workflow impact.'
- additionalLevers: 1-3 concrete categories such as 'annual billing on remaining tools', 'consolidate code assistants', 'right-size per-seat plans'. Empty array if no clear secondary levers exist.
- closing: must name a specific tool or concrete action with reasoning. If the lens is Already-optimized, frame closing around monitoring cadence and what signals to watch (e.g. 'watch for seat creep as headcount grows') rather than vendor migration. Use audit-flavored phrasing like 'The current stack appears appropriately sized for the team's usage and spend level' or 'No material optimization opportunities were identified in the current setup' when warranted — but do NOT use them verbatim every time.
- Tone: analytical, executive-level, financially honest. Talk like a CFO advising on stack posture — no hype, no buzzwords, no marketing language.
- Use ONLY tool names, categories, and findings present in the input JSON. Do not invent vendors, plans, prices, or percentages.
- NO preambles ('Here is…'). NO sign-offs. NO markdown. NO code fences. Pure JSON.`;

export interface SummaryInput {
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  optimizationScore: number;
  teamSize: string;
  toolCount: number;
  duplicateCount: number;
  alreadyOptimized: boolean;
  billingCycle: string;
  topRecommendations: Array<{
    tool: string;
    recommendation: string;
    monthlySavings: number;
    priorityLabel: string;
  }>;
}

export function toSummaryInput(
  report: AuditReport,
  teamSize: string,
  billingCycle: string,
  toolCount: number,
): SummaryInput {
  return {
    totalMonthlySpend: report.totalMonthlySpend,
    totalMonthlySavings: report.totalMonthlySavings,
    totalAnnualSavings: report.totalAnnualSavings,
    optimizationScore: report.optimizationScore,
    teamSize,
    toolCount,
    duplicateCount: report.duplicateCount,
    alreadyOptimized: report.alreadyOptimized,
    billingCycle,
    topRecommendations: report.recommendations.slice(0, 3).map((r) => ({
      tool: r.tool,
      recommendation: r.recommendation,
      monthlySavings: r.monthlySavings,
      priorityLabel: r.priorityLabel,
    })),
  };
}

export function fallbackSummary(input: SummaryInput): string {
  const {
    teamSize,
    toolCount,
    duplicateCount,
    alreadyOptimized,
    totalMonthlySavings,
    topRecommendations,
  } = input;

  const stackShape = toolCount <= 2
    ? "a compact stack"
    : toolCount <= 5
      ? "a moderate stack"
      : "a broad stack";

  if (alreadyOptimized || totalMonthlySavings < 25) {
    const dupRead = duplicateCount > 0
      ? "Some redundancy is present, but the dollar impact is small at this scale."
      : "No duplicate tooling was detected, suggesting the setup is already lean for the team size.";
    return `A ${teamSize}-person team running ${stackShape} for AI work. ${dupRead} Aggressive vendor migration isn't justified at this point — the highest-value next step is monthly monitoring to catch new opportunities as the stack evolves.`;
  }

  const lead = topRecommendations[0];
  const dupSentence = duplicateCount > 0
    ? "Overlapping tooling appears to be the largest single drag on efficiency, and consolidation would remove redundant cost without changing core workflows."
    : "No duplicates were detected; the opportunities here come from billing posture and plan fit rather than redundancy.";

  const leadCategory = lead?.priorityLabel ?? "Medium impact";
  const closer = leadCategory === "Billing optimization"
    ? `Switching ${lead!.tool} to annual billing is the cleanest quick win and a sensible first move.`
    : leadCategory === "High savings"
      ? `Acting on ${lead!.tool} first is where the audit points — it concentrates the most reclaimable spend.`
      : lead
        ? `Start with the ${lead.tool} adjustment and revisit in 30 days.`
        : `Work through the prioritized recommendations and revisit in 30 days.`;

  return `A ${teamSize}-person team running ${stackShape} across ${toolCount} AI tool${toolCount !== 1 ? "s" : ""}. ${dupSentence} ${closer}`;
}

export interface StructuredSummary {
  diagnosis: string;
  biggestSavingsLabel: string;
  biggestSavingsImpact: string;
  additionalLevers: string[];
  closing: string;
}

export function fallbackStructured(input: SummaryInput): StructuredSummary {
  const {
    teamSize,
    toolCount,
    duplicateCount,
    alreadyOptimized,
    totalMonthlySavings,
    totalMonthlySpend,
    topRecommendations,
    billingCycle,
  } = input;

  const stackShape =
    toolCount <= 2 ? "a compact stack"
      : toolCount <= 5 ? "a moderate stack"
        : "a broad stack";

  const teamPhrase =
    teamSize === "1-5" ? "small engineering team"
      : teamSize === "6-15" ? "mid-sized team"
        : teamSize === "16-50" ? "growing team"
          : teamSize === "51-200" ? "scale-up team"
            : teamSize === "200+" ? "enterprise team"
              : `${teamSize}-person team`;

  // ── Pick a tonal lens from input signals ─────────────────────────
  type Lens = "operational" | "financial" | "strategic" | "cautionary" | "optimized";

  const billingHeavy =
    topRecommendations.length > 0 &&
    topRecommendations.filter((r) => r.priorityLabel === "Billing optimization").length >=
      Math.ceil(topRecommendations.length / 2);

  const compounding =
    duplicateCount > 0 &&
    billingCycle === "monthly" &&
    topRecommendations.some((r) => r.priorityLabel !== "Billing optimization");

  const lens: Lens =
    alreadyOptimized || totalMonthlySavings < 25
      ? "optimized"
      : compounding
        ? "cautionary"
        : (totalMonthlySpend >= 1500 && topRecommendations.some((r) => r.tool.toLowerCase().includes("enterprise")))
          ? "strategic"
          : duplicateCount > 0
            ? "operational"
            : billingHeavy
              ? "financial"
              : topRecommendations.length > 0
                ? "operational"
                : "optimized";

  // ── Already-optimized lens ────────────────────────────────────────
  if (lens === "optimized") {
    const dupRead = duplicateCount > 0
      ? "A small amount of tooling overlap is present, but the dollar impact is immaterial at this scale."
      : "No redundant tooling was detected, which suggests subscriptions are paid for purposefully rather than accumulated.";

    // Vary the diagnosis opener so the report doesn't feel templated across reruns.
    const opener = duplicateCount > 0
      ? `Current AI spend appears disciplined for a ${teamPhrase} running ${stackShape}.`
      : `The current stack appears appropriately sized for a ${teamPhrase}'s usage and spend level.`;

    return {
      diagnosis: `${opener} ${dupRead} The overall posture reads as a stack that has already been pruned rather than one waiting for a cleanup pass.`,
      biggestSavingsLabel: duplicateCount > 0
        ? "Trim the redundant tool once usage data confirms which one the team actually relies on day-to-day."
        : "Hold the current configuration and revisit on the next billing cycle rather than chasing low-yield migrations.",
      biggestSavingsImpact: "Minimal at this scale",
      additionalLevers: [
        "watch for seat creep as headcount grows",
        "re-audit when adding any new AI tool",
      ],
      closing: "No material optimization opportunities were identified in the current setup; the right next step is a monthly spend check rather than vendor migration, and a larger lever will surface naturally as the team scales.",
    };
  }

  const lead = topRecommendations[0];
  const second = topRecommendations[1];

  const reasonClause = (priority: string): string =>
    priority === "Billing optimization"
      ? "to lock in lower recurring cost with minimal workflow impact"
      : priority === "High savings"
        ? "to remove the single largest source of recoverable spend"
        : priority === "Quick win"
          ? "for an immediate cost reduction that requires no migration"
          : "to right-size cost against actual usage";

  const leadSentence = lead
    ? `${lead.recommendation.replace(/\.$/, "").trim()} ${reasonClause(lead.priorityLabel)}.`
    : "Work through the prioritized recommendations starting with the highest-impact items first.";

  const levers: string[] = [];
  if (billingCycle === "monthly") levers.push("annual billing on remaining tools");
  if (duplicateCount > 0) levers.push("consolidate overlapping code assistants");
  if (topRecommendations.some((r) => r.priorityLabel === "Medium impact")) levers.push("right-size per-seat plans");
  if (second && levers.length === 0) levers.push(`address ${second.tool} after the lead change`);

  // ── Operational lens — workflow & redundancy ──────────────────────
  if (lens === "operational") {
    const dupContext = duplicateCount > 0
      ? "Overlapping coding assistants appear to be the largest drag on efficiency — consolidating them removes redundant cost without changing how anyone actually writes code."
      : "Most of the recoverable spend here sits in active workflows that can be tightened without disruption — seat counts, plan tiers, and tooling overlap.";

    return {
      diagnosis: `A ${teamPhrase} running ${stackShape} across ${toolCount} AI tool${toolCount !== 1 ? "s" : ""}. ${dupContext} The largest single opportunity is concentrated in ${lead?.tool ?? "the top recommendation"}, with secondary gains spread across plan-fit and seat utilization.`,
      biggestSavingsLabel: leadSentence,
      biggestSavingsImpact: lead ? `~$${lead.monthlySavings}/month lever` : "Spread across recs",
      additionalLevers: levers.slice(0, 3),
      closing: lead
        ? `Start with the ${lead.tool} change this quarter — it ships fastest with the least workflow disruption and clears the path to evaluate the remaining recommendations once cost data settles.`
        : "Work through the prioritized recommendations in order of impact and revisit cost posture in 30 days.",
    };
  }

  // ── Financial lens — contract & billing posture ───────────────────
  if (lens === "financial") {
    return {
      diagnosis: `A ${teamPhrase} running ${stackShape} where the dominant inefficiency sits in billing posture rather than tooling choice. Plans and seat counts look reasonable for the team's actual usage; the recurring cost is structured below market efficiency primarily because most subscriptions are on monthly cycles.`,
      biggestSavingsLabel: leadSentence,
      biggestSavingsImpact: lead ? `~$${lead.monthlySavings}/month lever` : "Billing-side gains",
      additionalLevers: levers.slice(0, 3),
      closing: lead
        ? `The ${lead.tool} billing change is the cleanest first move — it reshapes contract structure without touching the workflow surface, and frees up a clear baseline for evaluating the smaller adjustments.`
        : "Switch the remaining monthly subscriptions to annual cycles in a single pass and revisit cost posture once the new baseline lands.",
    };
  }

  // ── Strategic lens — vendor posture & growth path ─────────────────
  if (lens === "strategic") {
    return {
      diagnosis: `A ${teamPhrase} running ${stackShape} at a spend level where vendor posture starts to matter as much as line-item cost. Enterprise tooling appears to be carrying weight it doesn't need at the current scale, and the stack would benefit from being shaped around the workflows that are genuinely load-bearing.`,
      biggestSavingsLabel: leadSentence,
      biggestSavingsImpact: lead ? `~$${lead.monthlySavings}/month lever` : "Tier consolidation",
      additionalLevers: levers.slice(0, 3),
      closing: lead
        ? `Step ${lead.tool} down first — it concentrates the most reclaimable spend and gives the team a clearer baseline before the smaller billing and seat-level adjustments.`
        : "Re-shape the stack around the tools that are actually load-bearing and revisit tier choices once team size has stabilized.",
    };
  }

  // ── Cautionary lens — compounding inefficiencies ──────────────────
  return {
    diagnosis: `A ${teamPhrase} running ${stackShape} where multiple smaller inefficiencies are compounding. Tooling overlap, monthly billing, and seat-level drift each look minor in isolation; combined, they're the read of a stack accumulating cost faster than it's adding capability.`,
    biggestSavingsLabel: leadSentence,
    biggestSavingsImpact: lead ? `~$${lead.monthlySavings}/month lever` : "Compounding drift",
    additionalLevers: levers.slice(0, 3),
    closing: lead
      ? `Address the ${lead.tool} change first — it's the largest single source of drift, and clearing it makes the remaining adjustments easier to sequence without disrupting the team's working surface.`
      : "Sequence the changes in order of impact; the first action settles the baseline and the rest tighten the residual drift.",
  };
}

function extractJson(text: string): StructuredSummary | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Partial<StructuredSummary>;
    if (
      typeof parsed.diagnosis === "string" &&
      typeof parsed.biggestSavingsLabel === "string" &&
      typeof parsed.biggestSavingsImpact === "string" &&
      typeof parsed.closing === "string"
    ) {
      return {
        diagnosis: parsed.diagnosis,
        biggestSavingsLabel: parsed.biggestSavingsLabel,
        biggestSavingsImpact: parsed.biggestSavingsImpact,
        additionalLevers: Array.isArray(parsed.additionalLevers)
          ? parsed.additionalLevers.filter((s): s is string => typeof s === "string").slice(0, 3)
          : [],
        closing: parsed.closing,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export type StreamEvent =
  | { type: "structured"; value: StructuredSummary }
  | { type: "done"; source: "ai" | "fallback"; error?: string };

export async function* streamSummary(input: SummaryInput): AsyncGenerator<StreamEvent> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    yield { type: "structured", value: fallbackStructured(input) };
    yield { type: "done", source: "fallback", error: "GROQ_API_KEY not set" };
    return;
  }

  const client = new Groq({ apiKey });
  const userContent = JSON.stringify(input, null, 2);

  const timeoutMs = 20_000;
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    const completionPromise = client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Audit data:\n\n${userContent}\n\nReturn the JSON object now. No prose, no markdown, no code fences.`,
        },
      ],
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Groq API timeout (${timeoutMs / 1000}s)`)), timeoutMs);
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);
    const text = completion.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(text);

    if (parsed) {
      yield { type: "structured", value: parsed };
      yield { type: "done", source: "ai" };
    } else {
      yield { type: "structured", value: fallbackStructured(input) };
      yield { type: "done", source: "fallback", error: "Could not parse JSON from model response" };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    yield { type: "structured", value: fallbackStructured(input) };
    yield { type: "done", source: "fallback", error: message };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function generateSummary(input: SummaryInput): Promise<{
  structured: StructuredSummary;
  source: "ai" | "fallback";
  error?: string;
}> {
  let structured: StructuredSummary = fallbackStructured(input);
  let source: "ai" | "fallback" = "fallback";
  let error: string | undefined;
  for await (const event of streamSummary(input)) {
    if (event.type === "structured") structured = event.value;
    else {
      source = event.source;
      error = event.error;
    }
  }
  return { structured, source, ...(error ? { error } : {}) };
}
