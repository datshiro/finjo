import { createClient } from '@supabase/supabase-js'
import { type DBInsert } from '../schemas/transaction.js'

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }
  return createClient(url, key)
}

export interface TransactionRow {
  id: number
  user_id: number
  amount_dong: number
  currency: string
  category: string
  description: string
  merchant: string | null
  date: string
  source: string
  raw_input: string
  telegram_message_id: number
  created_at: string
}

export interface CategorySummary {
  category: string
  total: number
}

export async function insertTransaction(data: DBInsert): Promise<TransactionRow> {
  const supabase = getSupabaseClient()
  const { data: row, error } = await supabase
    .from('transactions')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`DB insert failed: ${error.message}`)
  }

  return row as TransactionRow
}

export async function queryTodayByCategory(
  userId: number,
  start: Date,
  end: Date,
): Promise<CategorySummary[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount_dong')
    .eq('user_id', userId)
    .gte('date', start.toISOString())
    .lt('date', end.toISOString())

  if (error) {
    throw new Error(`DB query failed: ${error.message}`)
  }

  return aggregateByCategory(data as { category: string; amount_dong: number }[])
}

export async function queryWeekByCategory(
  userId: number,
  start: Date,
  end: Date,
): Promise<CategorySummary[]> {
  return queryTodayByCategory(userId, start, end)
}

function aggregateByCategory(
  rows: { category: string; amount_dong: number }[],
): CategorySummary[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount_dong)
  }
  return Array.from(totals.entries()).map(([category, total]) => ({ category, total }))
}

export function countTransactions(summaries: CategorySummary[]): number {
  // We don't have per-row counts from aggregation; the caller tracks this separately.
  // This is a placeholder — queries that need counts should use a separate select count.
  return summaries.length
}

export async function queryTransactionCount(
  userId: number,
  start: Date,
  end: Date,
): Promise<number> {
  const supabase = getSupabaseClient()
  const { count, error } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('date', start.toISOString())
    .lt('date', end.toISOString())

  if (error) {
    throw new Error(`DB count query failed: ${error.message}`)
  }

  return count ?? 0
}
