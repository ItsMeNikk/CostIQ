import { streamSummary, type SummaryInput } from "@/lib/ai/generateSummary";

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
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (!isValidInput(body)) {
    return new Response(JSON.stringify({ error: "Invalid summary input shape" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamSummary(body)) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          if (event.type === "done" && event.source === "fallback" && event.error) {
            console.warn("[/api/summary] fallback:", event.error);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[/api/summary] stream error:", message);
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "done", source: "fallback", error: message }) + "\n"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
