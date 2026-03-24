# finjo

Zero-friction personal finance journal for Vietnam.

Send a Telegram message like `cafe sáng 45k` → auto-categorized expense logged in under 2 seconds.

## How it works

- **Capture:** Text message to the Telegram bot (Vietnamese natural language)
- **Parse:** Gemini Flash extracts amount, category, description, date
- **Store:** Supabase (Postgres) — `amount_dong` as BIGINT, UTC timestamps
- **Review:** `/today` and `/week` commands for spending summaries

## Tech stack

- Node.js + Grammy (Telegram bot)
- Google Gemini Flash 2.0 (Vietnamese NLP)
- Supabase / Postgres (database)
- Fly.io (bot hosting, webhook mode)
- Vitest + eval script (testing)

## Status

**Phase 1 (in progress):** Core bot — text input → parse → save → /today, /week commands

See `TODOS.md` for deferred items and `CHANGELOG.md` for version history.
