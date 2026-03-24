# TODOS

## Phase 2

### /month command
**Priority:** P2
**What:** Add `/month` Telegram command — "this month so far" spending summary by category.
**Why:** Monthly context is the most useful window for spending discipline. Already in the design doc's command list but not in Phase 1 build tasks.
**How to apply:** Same query pattern as `/week`. UTC+7-aware date boundary using first day of current month in Asia/Ho_Chi_Minh. Filter WHERE date >= first_of_month AT TIME ZONE 'Asia/Ho_Chi_Minh'.
**Pros:** 30-minute addition once /week is implemented. No new dependencies.
**Cons:** Minor Phase 1 scope expansion if added early.
**Depends on:** /week implementation (same pattern).

---

## Phase 1 (add alongside eval script)

### Labeled eval fixtures
**Priority:** P1
**What:** Create `eval/fixtures.json` with 20+ labeled Vietnamese expense inputs + expected JSON outputs.
**Why:** The `npm run eval` script needs a ground truth corpus to give a pass/fail score. Without fixtures, it's manual eyeballing and can't detect LLM prompt regressions.
**How to apply:** Cover: food (cafe, bữa trưa), transport (Grab, xe bus), shorthand amounts (45k, 1.5tr, 100 nghìn), relative dates (hôm qua, tối qua, sáng nay), error cases (not_an_expense, currency_not_supported, needs_clarification), mixed Vietnamese/English inputs.
**Pros:** Reproducible eval. Catches prompt regressions before deploy. Runs manually (costs money) but consistent.
**Cons:** 30 minutes to write the fixture file.
**Depends on:** eval/run-evals.ts (Phase 1 plan item).

---

## Completed

<!-- Items completed in shipped versions move here -->
