// Eval script: runs fixtures through parser, scores results
// Only run if GEMINI_API_KEY is set
// Usage: npm run eval
// Costs real API calls — designed for pre-ship validation only

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { DateTime } from 'luxon'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface Fixture {
  input: string
  expected: {
    amount_dong?: number
    category?: string
    description_contains?: string
    merchant_contains?: string
    date_is_yesterday?: boolean
    error?: string
  }
}

interface EvalResult {
  input: string
  passed: boolean
  reason?: string
  actual?: unknown
}

async function runEvals() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set. Skipping evals.')
    process.exit(0)
  }

  const fixturesPath = join(__dirname, 'fixtures.json')
  const fixtures: Fixture[] = JSON.parse(readFileSync(fixturesPath, 'utf-8'))

  console.log(`Running ${fixtures.length} eval fixtures against Gemini API...\n`)

  // Dynamically import to allow proper module resolution
  const { parseExpense } = await import('../src/services/parser.js')

  const results: EvalResult[] = []

  for (const fixture of fixtures) {
    process.stdout.write(`  Testing: "${fixture.input}" ... `)

    try {
      const result = await parseExpense(fixture.input, apiKey)
      const passed = checkResult(result, fixture.expected)
      results.push({ input: fixture.input, passed: passed.ok, reason: passed.reason, actual: result })
      console.log(passed.ok ? 'PASS' : `FAIL — ${passed.reason}`)
    } catch (err) {
      results.push({ input: fixture.input, passed: false, reason: `Exception: ${err}` })
      console.log(`FAIL — Exception: ${err}`)
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500))
  }

  const passed = results.filter((r) => r.passed).length
  const total = results.length
  const pct = Math.round((passed / total) * 100)
  const threshold = 85
  const overallPass = pct >= threshold

  console.log('\n' + '─'.repeat(50))
  console.log(`${passed}/${total} (${pct}%) — ${overallPass ? 'PASS' : 'FAIL'}`)

  if (!overallPass) {
    console.log(`\nFailed fixtures:`)
    for (const r of results.filter((x) => !x.passed)) {
      console.log(`  ✗ "${r.input}" — ${r.reason}`)
      if (r.actual) console.log(`    Actual: ${JSON.stringify(r.actual)}`)
    }
    process.exit(1)
  }
}

interface CheckResult {
  ok: boolean
  reason?: string
}

function checkResult(actual: unknown, expected: Fixture['expected']): CheckResult {
  if (expected.error) {
    if (typeof actual !== 'object' || actual === null || !('error' in actual)) {
      return { ok: false, reason: `Expected error "${expected.error}" but got success` }
    }
    if ((actual as { error: string }).error !== expected.error) {
      return {
        ok: false,
        reason: `Expected error "${expected.error}" but got "${(actual as { error: string }).error}"`,
      }
    }
    return { ok: true }
  }

  if (typeof actual !== 'object' || actual === null || 'error' in actual) {
    return { ok: false, reason: `Expected success but got error: ${JSON.stringify(actual)}` }
  }

  const a = actual as Record<string, unknown>

  if (expected.amount_dong !== undefined && a['amount_dong'] !== expected.amount_dong) {
    return {
      ok: false,
      reason: `amount_dong: expected ${expected.amount_dong}, got ${a['amount_dong']}`,
    }
  }

  if (expected.category !== undefined && a['category'] !== expected.category) {
    return {
      ok: false,
      reason: `category: expected "${expected.category}", got "${a['category']}"`,
    }
  }

  if (expected.description_contains !== undefined) {
    const desc = (a['description'] as string ?? '').toLowerCase()
    if (!desc.includes(expected.description_contains.toLowerCase())) {
      return {
        ok: false,
        reason: `description "${a['description']}" does not contain "${expected.description_contains}"`,
      }
    }
  }

  if (expected.merchant_contains !== undefined) {
    const merchant = (a['merchant'] as string ?? '').toLowerCase()
    if (!merchant.includes(expected.merchant_contains.toLowerCase())) {
      return {
        ok: false,
        reason: `merchant "${a['merchant']}" does not contain "${expected.merchant_contains}"`,
      }
    }
  }

  if (expected.date_is_yesterday === true) {
    const dateStr = a['date'] as string | null
    if (!dateStr) {
      return { ok: false, reason: 'Expected a date (yesterday) but date is null' }
    }
    const parsed = DateTime.fromISO(dateStr, { zone: 'Asia/Ho_Chi_Minh' })
    const yesterday = DateTime.now().setZone('Asia/Ho_Chi_Minh').minus({ days: 1 })
    if (parsed.toISODate() !== yesterday.toISODate()) {
      return {
        ok: false,
        reason: `Expected yesterday (${yesterday.toISODate()}) but got ${parsed.toISODate()}`,
      }
    }
  }

  return { ok: true }
}

runEvals().catch((err) => {
  console.error('Eval script failed:', err)
  process.exit(1)
})
