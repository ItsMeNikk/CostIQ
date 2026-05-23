import { NextResponse } from "next/server";
import { generateSummary, type SummaryInput } from "@/lib/ai/generateSummary";

export const runtime = "nodejs";

function isValidInput(value: unknown): value is SummaryInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.totalMonthlySpend === "number" &&
    typeof v.totalMonthlySavings === "number" &&
    typeof v.totalAnnualSavings === "number" &&
    typeof v.optimizationScore === "number" &&
    typeof v.teamSize === "string" &&
    typeof v.toolCount === "number" &&
    typeof v.duplicateCount === "number" &&
    typeof v.alreadyOptimized === "boolean" &&
    typeof v.billingCycle === "string" &&
    Array.isArray(v.topRecommendations)
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidInput(body)) {
    return NextResponse.json({ error: "Invalid summary input shape" }, { status: 400 });
  }

  const result = await generateSummary(body);
  return NextResponse.json(result);
}
