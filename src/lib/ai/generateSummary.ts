import Groq from "groq-sdk";
import type { AuditReport } from "@/lib/audit-engine";

const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = 360;
const TEMPERATURE = 0.35;

const SYSTEM_PROMPT = `You are CostIQ, an AI spend optimization platform writing the executive summary that appears at the top of an audit report.

CRITICAL: The report UI displays Monthly Spend, Annual Savings, Optimization Score, and Top Opportunity as a separate metric strip. Your job is to explain WHY the numbers look the way they do and WHAT to do about it. DO NOT restate dollar figures or the score — they appear visually elsewhere.

OUTPUT FORMAT
You MUST return a single JSON object. No prose before or after. No markdown fences. The schema is:

{
  "diagnosis": "ONE sentence characterizing the team and stack posture. Plain prose. ≤25 words. No dollar figures.",
  "biggestSavingsLabel": "The biggest single optimization opportunity, named concretely (e.g. 'Unused GitHub Copilot seats', 'Cursor on monthly billing', 'Overlapping code assistants'). ≤8 words. No dollar figure.",
  "biggestSavingsImpact": "A short impact phrase (e.g. '~$152/month', 'Quick win', 'Largest single lever'). ≤6 words.",
  "additionalLevers": ["short phrase", "short phrase"],
  "closing": "ONE sentence closing recommendation: the single most valuable next step. ≤25 words. No dollar figures. No promises of ROI."
}

RULES
- additionalLevers: 1–3 short phrases (2–5 words each). Examples: "annual billing on most tools", "reducing overlapping coding assistants", "right-sizing enterprise plans". Omit the field (use an empty array) if there are no clear secondary levers.
- If the audit shows alreadyOptimized=true OR totalMonthlySavings<25, frame the diagnosis as "already lean / well-disciplined" and make the closing about monitoring, not migration.
- Use ONLY tool names, categories, and findings present in the input JSON. Do not invent vendors, plans, or figures.
- Tone: analytical, executive-level, financially honest. No hype. No marketing language.
- NO preambles ("Here is…", "Summary:…"). NO sign-offs. NO markdown. NO code fences. Pure JSON.`;

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
    topRecommendations,
    billingCycle,
  } = input;

  const stackShape = toolCount <= 2
    ? "a compact stack"
    : toolCount <= 5
      ? "a moderate stack"
      : "a broad stack";

  if (alreadyOptimized || totalMonthlySavings < 25) {
    return {
      diagnosis: `A ${teamSize}-person team running ${stackShape} for AI work, with disciplined tool selection and no significant overspending.`,
      biggestSavingsLabel: duplicateCount > 0 ? "Minor redundancy in current tooling" : "No material savings detected",
      biggestSavingsImpact: "Negligible impact",
      additionalLevers: ["periodic seat reviews", "track usage as team scales"],
      closing: "The highest-value next step is monthly monitoring — not vendor migration — to catch new opportunities as the stack evolves.",
    };
  }

  const lead = topRecommendations[0];
  const levers: string[] = [];
  if (billingCycle === "monthly") levers.push("switch eligible tools to annual billing");
  if (duplicateCount > 0) levers.push("reduce overlapping coding assistants");
  if (topRecommendations.some((r) => r.priorityLabel === "Medium impact")) levers.push("right-size per-seat plans");

  return {
    diagnosis: `A ${teamSize}-person team running ${stackShape} across ${toolCount} AI tool${toolCount !== 1 ? "s" : ""}.`,
    biggestSavingsLabel: lead ? lead.recommendation : "Multiple medium opportunities",
    biggestSavingsImpact: lead ? `~$${lead.monthlySavings}/month` : "Spread across recs",
    additionalLevers: levers.slice(0, 3),
    closing: lead
      ? `Acting on the ${lead.tool} adjustment first is the cleanest move; revisit the rest in 30 days.`
      : "Work through the prioritized recommendations and revisit in 30 days.",
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
