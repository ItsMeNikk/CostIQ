
## How to run

```
npm install
npm test
```

CI runs the same command (`.github/workflows/ci.yml`). For watch mode locally: `npx vitest`.

## `src/lib/audit-engine.test.ts` — 7 tests

The audit engine is pure logic, no I/O — tests run in under a second, no mocks needed.

1. empty stack returns zero totals and no recommendations
2. monthly billing on Cursor Pro produces an annual-billing rec
3. annual billing already set produces no billing rec
4. Cursor + Copilot triggers a consolidation rec
5. small team on Cursor Enterprise gets a downgrade rec
6. totalMonthlySpend sums tool spends; annual savings = monthly × 12
7. optimization score stays in [30, 98] for a messy stack
