# Changelog

All notable changes to Finjo will be documented here.

## [0.1.0.0] - 2026-03-24

### Added
- Phase 1 bot: Node.js + Grammy Telegram bot (webhook mode)
- Vietnamese NLP via Gemini Flash 2.0 — parses `cafe sáng 45k` → structured record
- Gemini prompt injects current Asia/Ho_Chi_Minh time for accurate relative date resolution
- Zod validation between LLM response and DB insert
- Supabase/Postgres integration with BIGINT `amount_dong`, UNIQUE `telegram_message_id`
- `/start`, `/today`, `/week` commands with UTC+7-aware date boundaries
- Auth middleware: silent drop for unknown senders, server-side logging
- Vitest unit tests: 14 tests covering parser, timezone utilities, auth middleware
- Eval script (`npm run eval`) with 20 labeled Vietnamese fixtures
- Fly.io deployment config (Singapore region, `min_machines_running=1`)

## [0.0.1.0] - 2026-03-24

### Added
- TODOS.md with Phase 1 and Phase 2 deferred items from eng review
- CLAUDE.md with gstack skill configuration for the project
- VERSION and CHANGELOG files (project initialization)
