export interface ToolConfig {
  plan: string;
  monthlySpend: number | null;
  seats: number | null;
}

export type MissingField = "plan" | "spend" | "seats";

export interface ToolValidation {
  valid: boolean;
  missing: MissingField[];
  requiresSeats: boolean;
}

export interface AllToolsValidation {
  allValid: boolean;
  perTool: Record<string, ToolValidation>;
  incompleteCount: number;
}

const PER_USER_PLAN_IDS: Record<string, string[]> = {
  cursor: ["business", "enterprise"],
  copilot: ["business", "enterprise"],
  claude: ["team", "enterprise"],
  chatgpt: ["team", "enterprise"],
  "anthropic-api": ["enterprise"],
  "openai-api": ["scale", "enterprise"],
  gemini: [],
  windsurf: ["team", "enterprise"],
  midjourney: ["enterprise"],
  v0: ["team", "enterprise"],
};

export function isPerUserPlan(toolKey: string, planId: string): boolean {
  if (!planId) return false;
  return PER_USER_PLAN_IDS[toolKey]?.includes(planId) ?? false;
}

export function validateToolConfig(
  toolKey: string,
  config: ToolConfig | undefined,
): ToolValidation {
  const missing: MissingField[] = [];
  const plan = config?.plan ?? "";

  if (!plan) missing.push("plan");
  if (config?.monthlySpend == null) missing.push("spend");

  const requiresSeats = !!plan && isPerUserPlan(toolKey, plan);
  if (requiresSeats && (config?.seats == null || config.seats < 1)) {
    missing.push("seats");
  }

  return {
    valid: missing.length === 0,
    missing,
    requiresSeats,
  };
}

export function validateAllTools(
  selectedTools: string[],
  configs: Record<string, ToolConfig>,
): AllToolsValidation {
  const perTool: Record<string, ToolValidation> = {};
  let incompleteCount = 0;

  for (const toolKey of selectedTools) {
    const result = validateToolConfig(toolKey, configs[toolKey]);
    perTool[toolKey] = result;
    if (!result.valid) incompleteCount += 1;
  }

  return {
    allValid: selectedTools.length > 0 && incompleteCount === 0,
    perTool,
    incompleteCount,
  };
}

export function hasUsableReportData(report: {
  totalMonthlySpend: number;
  providerBreakdown: { currentSpend: number }[];
}): boolean {
  if (!Number.isFinite(report.totalMonthlySpend) || report.totalMonthlySpend <= 0) {
    return false;
  }
  return report.providerBreakdown.some((p) => p.currentSpend > 0);
}
