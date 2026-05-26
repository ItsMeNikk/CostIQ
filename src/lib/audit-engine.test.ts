import { describe, it, expect } from "vitest";
import { runAudit, type ToolInput } from "./audit-engine";

const mkTool = (key: string, plan: string, monthlySpend: number, seats = 1): ToolInput => ({
  key, label: key, category: "", color: "", plan, monthlySpend, seats,
});

describe("runAudit", () => {
  it("empty stack returns zero totals and no recommendations", () => {
    const report = runAudit({ tools: [], teamSize: "1-5", billingCycle: "monthly" });
    expect(report.recommendations).toHaveLength(0);
    expect(report.totalMonthlySpend).toBe(0);
    expect(report.totalMonthlySavings).toBe(0);
  });

  it("monthly billing on Cursor Pro produces an annual-billing rec", () => {
    const report = runAudit({
      tools: [mkTool("cursor", "pro", 20)],
      teamSize: "1-5",
      billingCycle: "monthly",
    });
    const rec = report.recommendations.find((r) => r.category === "billing");
    expect(rec).toBeDefined();
    expect(rec!.monthlySavings).toBeGreaterThan(0);
  });

  it("annual billing already set produces no billing rec", () => {
    const report = runAudit({
      tools: [mkTool("cursor", "pro", 20)],
      teamSize: "1-5",
      billingCycle: "annual",
    });
    expect(report.recommendations.filter((r) => r.category === "billing")).toHaveLength(0);
  });

  it("Cursor + Copilot triggers a consolidation rec", () => {
    const report = runAudit({
      tools: [mkTool("cursor", "pro", 20), mkTool("copilot", "individual", 10)],
      teamSize: "1-5",
      billingCycle: "monthly",
    });
    expect(report.recommendations.find((r) => r.category === "consolidation")).toBeDefined();
    expect(report.duplicateCount).toBeGreaterThan(0);
  });

  it("small team on Cursor Enterprise gets a downgrade rec", () => {
    const report = runAudit({
      tools: [mkTool("cursor", "enterprise", 500, 5)],
      teamSize: "1-5",
      billingCycle: "monthly",
    });
    expect(report.recommendations.find((r) => r.category === "downgrade")).toBeDefined();
  });

  it("totalMonthlySpend sums tool spends; annual savings = monthly * 12", () => {
    const report = runAudit({
      tools: [
        mkTool("cursor", "pro", 20),
        mkTool("claude", "pro", 20),
        mkTool("chatgpt", "plus", 20),
      ],
      teamSize: "1-5",
      billingCycle: "monthly",
    });
    expect(report.totalMonthlySpend).toBe(60);
    expect(report.totalAnnualSavings).toBe(report.totalMonthlySavings * 12);
  });

  it("optimization score stays in [30, 98] for a messy stack", () => {
    const report = runAudit({
      tools: [
        mkTool("cursor", "enterprise", 500, 10),
        mkTool("copilot", "business", 190, 10),
        mkTool("windsurf", "team", 250, 10),
        mkTool("claude", "team", 250, 10),
        mkTool("chatgpt", "team", 250, 10),
      ],
      teamSize: "1-5",
      billingCycle: "monthly",
    });
    expect(report.optimizationScore).toBeGreaterThanOrEqual(30);
    expect(report.optimizationScore).toBeLessThanOrEqual(98);
  });
});
