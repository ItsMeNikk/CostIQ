# PROMPTS.md — AI-Generated Audit Summaries

## What this document covers

CostIQ uses the Anthropic API to generate ~100-word executive summaries for audit reports. This file documents the full system prompt, the rationale for using deterministic logic everywhere _except_ summarization, the strategy for preventing hallucinated numbers, the fallback path, and the prompt iterations we went through.

---

## Where AI is and isn't used

| Concern | How it's computed |
| --- | --- |
| Monthly / annual savings | Deterministic rule-based engine (`src/lib/audit-engine.ts`). |
| Optimization score (0–100) | Deterministic, weighted by spend, savings ratio, duplicates, and high-impact rec count. |
| Per-tool recommendations | Deterministic rules (`checkAnnualBilling`, `checkDuplicateCodeTools`, `checkPerSeatInefficiency`, etc.) reading from hardcoded pricing data in `src/lib/pricing/*.ts`. |
| Pricing data | Static config files, manually verified against vendor pricing pages. |
| Provider breakdown, duplicate count, status | Deterministic aggregation of audit inputs. |
| Plain-English executive summary | **AI-generated** (this document). |

**"Knowing when NOT to use AI is part of the test."** We took that seriously. Financial figures are computed by rules a junior engineer can audit, read, and unit-test — they don't change based on temperature, model version, or sampling. An LLM only summarizes the already-computed result.

### Why this split?

- **Math + pricing must be deterministic.** A customer trying to decide whether to switch from monthly to annual billing on Copilot needs to see the same `$48/mo savings` figure every time they refresh. An LLM that recomputes savings from prompt context will drift — different models, different temperatures, different runs. Even with temperature 0, no LLM should be doing financial arithmetic that customers act on.
- **LLMs hallucinate confidently.** If we asked Claude to "look at this stack and recommend savings," it would happily invent plan names, fabricate discount percentages, and overstate savings to sound helpful. The deterministic engine literally cannot produce numbers that aren't in the pricing data.
- **Summarization is the right LLM job.** Translating "5 recommendations, $480/mo total savings, biggest from Cursor + Copilot consolidation" into a sentence a CTO can read in 10 seconds is something LLMs are unambiguously good at, and the variation across runs is fine because the underlying numbers are pinned.

---

## Architecture

```
┌──────────────────┐    ┌────────────────────┐    ┌──────────────────────┐
│ Audit form input │ ─▶ │ Deterministic      │ ─▶ │ AuditReport object   │
│ (tools, plan,    │    │ engine             │    │ - totals             │
│  spend, seats)   │    │ (audit-engine.ts)  │    │ - recommendations    │
└──────────────────┘    └────────────────────┘    │ - score              │
                                                   │ - duplicateCount     │
                                                   └──────────┬───────────┘
                                                              │
                                          ┌───────────────────┴────────┐
                                          ▼                            ▼
                              ┌───────────────────────┐    ┌──────────────────────┐
                              │ Report UI renders     │    │ Client POSTs to      │
                              │ ALL numbers, charts,  │    │ /api/summary with    │
                              │ recommendations from  │    │ this AuditReport     │
                              │ the report object     │    │ JSON                 │
                              └───────────────────────┘    └──────────┬───────────┘
                                                                       ▼
                                                          ┌──────────────────────┐
                                                          │ generateSummary()    │
                                                          │ - Builds prompt      │
                                                          │ - Calls Anthropic    │
                                                          │ - On failure:        │
                                                          │   deterministic      │
                                                          │   fallback           │
                                                          └──────────┬───────────┘
                                                                     ▼
                                                          ┌──────────────────────┐
                                                          │ Summary string       │
                                                          │ (≤100 words)         │
                                                          │ cached in            │
                                                          │ sessionStorage per   │
                                                          │ reportId             │
                                                          └──────────────────────┘
```

### Files

- `src/lib/ai/generateSummary.ts` — Anthropic SDK call, prompt builder, deterministic fallback.
- `src/app/api/summary/route.ts` — Next.js Route Handler (server-only). Validates input shape, calls `generateSummary`, returns `{ summary, source, error? }`.
- `src/app/report/[id]/page.tsx` — Client component. Fetches `/api/summary` on mount when the report is usable, renders the dark "AI insights" card with a shimmer skeleton while loading.

The API key (`ANTHROPIC_API_KEY` in `.env.local`) **never leaves the server**. The route handler reads it from `process.env`, calls Anthropic, returns plain text to the browser.

---

## System Prompt (production)

```
You are CostIQ, an AI spend optimization platform.

You write concise, professional executive summaries (≤100 words) for audit
reports based on pre-computed analysis results. The numbers, recommendations,
and savings figures are ALL calculated deterministically by CostIQ's rule-based
audit engine — you must not invent, recalculate, modify, or extrapolate any
financial figure. Only summarize what is provided.

Tone: financially honest, startup-oriented, plain English. No hype, no
exaggeration, no marketing fluff. If savings are small, say so plainly. If
savings are large, name the biggest opportunity in one phrase.

Hard rules:
- Use ONLY the numbers and findings in the input JSON. Do not add or estimate
  any new figure.
- Do not promise outcomes, ROI percentages, or future savings beyond what the
  input states.
- Do not invent recommendations, vendor names, plan names, or pricing.
- 100 words MAXIMUM. Aim for 70–95.
- Plain prose. No bullet points, no headings, no emojis, no markdown.
- Single paragraph.
```

### User message shape

```
Audit results:

{
  "totalMonthlySpend": 2010,
  "totalMonthlySavings": 480,
  "totalAnnualSavings": 5760,
  "optimizationScore": 71,
  "teamSize": "6-15",
  "toolCount": 5,
  "duplicateCount": 1,
  "alreadyOptimized": false,
  "billingCycle": "monthly",
  "topRecommendations": [
    { "tool": "Cursor + Copilot", "recommendation": "Consolidate ...",
      "monthlySavings": 150, "priorityLabel": "High savings" },
    ...
  ]
}

Write the executive summary now. ≤100 words. Plain prose. Single paragraph.
```

### Model & sampling

| Setting | Value | Why |
| --- | --- | --- |
| `model` | `claude-haiku-4-5` | A 100-word summarization is firmly in Haiku's wheelhouse. Cheap (~$1/1M input), fast, and unlike Opus 4.7, Haiku 4.5 still accepts `temperature`. Result quality is indistinguishable from Opus for this task; latency is much better. |
| `max_tokens` | 220 | ~100 English words runs ~130 tokens. 220 gives slack for slightly longer responses without inviting drift. |
| `temperature` | 0.4 | Low enough to keep tone consistent and figures verbatim; high enough that summaries don't read like the same sentence with names swapped. |
| `system` | See above | Pinned. Never interpolates dynamic data → maximizes prompt-cache hit rate. |

**Note on Opus 4.7**: the assignment spec suggested `temperature ~0.4`, but Opus 4.7 returns 400 on `temperature` (sampling params were removed). Switching to Haiku preserves the temperature knob and is the right cost/latency tradeoff for this workload.

---

## Hallucination prevention strategy

The risk is a confidently-wrong number landing in front of a finance team. Layers, in order of importance:

1. **The LLM never sees the raw audit input.** It only sees the post-computed `AuditReport`. There's nothing for it to "calculate" — it can only summarize. The numbers are stamped into the prompt.
2. **All numbers in the prompt come from `runAudit()`, not the user.** The engine has already validated, rounded, and aggregated everything. The LLM cannot accidentally add unrelated figures.
3. **System prompt explicitly bans new figures, recommendations, vendor names, and pricing.** The instruction is repeated three times because it's the single most load-bearing rule.
4. **The UI does not let the LLM dictate any rendered number.** Every dollar figure on the report page — KPIs, charts, recommendation cards, provider details, bottom CTA copy — is bound to fields on the `AuditReport` object. The LLM summary is rendered in ONE place (the dark "AI insights" card) and is read-only text. If the LLM hallucinates `$5,000/mo savings` in its summary while the engine computed `$480/mo`, the user immediately sees the contradiction with the KPI cards next to it.
5. **Deterministic fallback on failure.** If the API call errors, times out, returns empty, or the key is missing, the user gets a templated summary built from the same `AuditReport` fields. The report never breaks on AI failure.
6. **Server-side validation of input shape.** The `/api/summary` route checks that the POSTed body has the expected fields with the expected types. A malformed client request returns 400 before any model call.
7. **10-second timeout on the Anthropic call.** Hard ceiling. Beyond that we fall back rather than block the report.

We considered structured outputs (forcing the LLM to emit JSON with a typed `summary: string` field), but it adds latency, costs more tokens, and provides zero additional safety here — the only output is one paragraph of prose. The benefit of structured outputs is enforcing schema on tool inputs, not free-form text.

---

## Fallback summary (deterministic)

When the API call fails, `fallbackSummary()` in `src/lib/ai/generateSummary.ts` builds a summary from the same fields the LLM would have seen. Two branches:

**Low-savings branch** (already-optimized OR savings < $25/mo):

> Your AI stack is well-tuned. Across N tools for a {teamSize}-person team, monthly spend is $X with an optimization score of Y/100. Only minor opportunities remain — projected savings of $Z/mo ($W/yr) aren't material enough to prioritize. Monthly monitoring is the highest-value next step to catch new opportunities as your stack grows.

**Material-savings branch**:

> For a {teamSize}-person team on N AI tools, current spend runs $X/mo with an optimization score of Y/100. [Duplicate tooling drives the largest single opportunity.] The biggest lever is {tool}: {recommendation} (~$Z/mo). Total realistic savings: $A/mo, $B/yr if all recommendations are applied.

These are not designed to be _better_ than the LLM output — they're designed to be safe, accurate, and grammatically clean when the LLM is unavailable. In a production system this fallback is what runs during a Claude outage; the report stays usable.

---

## Prompt iterations and failed approaches

This is what we tried before landing on the production prompt.

### v1 — "Be helpful"

> You are a friendly AI spend analyst. Write a helpful summary of these audit results.

**Failed because**: Claude got creative. It would invent plausible-sounding rationale ("based on your team's growth trajectory, we project…"), add caveats nobody asked for, and pad the summary with platitudes. Word count drifted to 180+.

### v2 — Add word limit

> You are a friendly AI spend analyst. Write a helpful summary of these audit results in 100 words or less.

**Failed because**: Word count came down but the model still invented numbers — saw "$480/mo savings" and would extrapolate "$2,400/year" (correct in this case, but it's doing arithmetic, which we explicitly don't want). Also kept using "could potentially" / "may unlock" language that overstated certainty.

### v3 — Forbid invention, list rules

> You are CostIQ. Summarize the audit. Do not invent any numbers. Be honest about low savings.

**Failed because**: Too short to disambiguate. The model would still add filler ("Looking at your spend pattern, it appears that…"). And without explicit tone guidance, summaries swung between "great news!" boosterism and "concerningly, your stack…" doom — neither of which is what a CTO wants.

### v4 — Tone block + hard rules section

The current production prompt. Adds explicit tone guidance ("financially honest, startup-oriented, plain English, no hype"), repeats the "use ONLY the numbers provided" rule as a hard constraint, bans markdown/bullets/emoji, and asks for a single paragraph. Word count is anchored at 70–95 (aiming below the 100 ceiling).

Result: outputs read like a junior CFO writing a board snippet. Numbers verbatim. No marketing language. Variance across runs is in word choice, not in figures or conclusions.

### Other things tried and dropped

- **Few-shot examples in the system prompt**: marginal improvement; bloated the prompt; cache write cost outweighed quality lift for this short task.
- **Asking for a confidence score**: Claude would happily emit "Confidence: 92%" with no basis. Removed.
- **Asking for "key insight" extraction**: produced output that read like a marketing one-pager. The deterministic engine already emits structured `keyInsights[]` and `recommendations[]` — the summary's job is glue prose, not parallel feature extraction.

---

## Operations

### Setup

Add to `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

If the variable is missing, every request returns the deterministic fallback with `source: "fallback"` and `error: "ANTHROPIC_API_KEY not set"`. The report still renders correctly.

### Caching

Generated summaries are cached client-side in `sessionStorage` under `costiq_ai_summary_<reportId>` so navigating away and back doesn't re-spend tokens. Cache lives for the session only; refreshing the tab keeps the cached summary; closing the tab clears it.

### Observability

The route handler returns `{ summary, source: "ai" | "fallback", error? }`. The client doesn't surface the error to end users (the report just renders the fallback), but the source is displayed in the eyebrow text — `Powered by Claude` for `ai`, `CostIQ analysis` for `fallback`. This makes it visually clear during development whether the API call succeeded.

### Cost

Haiku 4.5 input: $1.00/1M tokens. Output: $5.00/1M tokens.
- Input per request: ~500 tokens (system prompt + audit JSON) ≈ $0.0005
- Output per request: ~130 tokens ≈ $0.00065
- Per-report cost: **~$0.0012** (one-tenth of a cent)

A startup running 1,000 audits/month spends ~$1.20 on summaries.
