import { type Context } from 'grammy'
import {
  getTodayBoundariesUTC,
  getWeekBoundariesUTC,
  getTodayDisplay,
  getWeekRangeDisplay,
} from '../utils/time.js'
import {
  queryTodayByCategory,
  queryWeekByCategory,
  queryTransactionCount,
  type CategorySummary,
} from '../services/db.js'
import { CATEGORY_EMOJI, type Category } from '../schemas/transaction.js'

function formatSummaryLines(summaries: CategorySummary[]): string {
  return summaries
    .map((s) => {
      const emoji = CATEGORY_EMOJI[s.category as Category] ?? '📦'
      const label = s.category
      const amountK = Math.round(s.total / 1000)
      return `${emoji} ${label.charAt(0).toUpperCase() + label.slice(1)}: ${amountK}k đ`
    })
    .join('\n')
}

function totalAmount(summaries: CategorySummary[]): number {
  return summaries.reduce((sum, s) => sum + s.total, 0)
}

export async function handleStart(ctx: Context): Promise<void> {
  const message = `Chào mừng đến với Finjo! 🎉

Gửi chi tiêu của bạn bằng tiếng Việt tự nhiên:
• "cafe sáng 45k"
• "Grab về nhà 85 nghìn"
• "ăn trưa bún bò 60k"

Lệnh:
/today — chi tiêu hôm nay
/week — chi tiêu tuần này`

  await ctx.reply(message)
}

export async function handleToday(ctx: Context): Promise<void> {
  const userId = ctx.from?.id
  if (!userId) return

  const { start, end } = getTodayBoundariesUTC()
  const dateDisplay = getTodayDisplay()

  let summaries: CategorySummary[]
  let count: number
  try {
    summaries = await queryTodayByCategory(userId, start, end)
    count = await queryTransactionCount(userId, start, end)
  } catch (err) {
    console.error('Today query error:', err)
    await ctx.reply('Có lỗi xảy ra, thử lại nhé 🙏')
    return
  }

  if (summaries.length === 0) {
    await ctx.reply('📊 Hôm nay chưa có giao dịch nào.')
    return
  }

  const lines = formatSummaryLines(summaries)
  const total = totalAmount(summaries)
  const totalK = Math.round(total / 1000)

  const message = `📊 Hôm nay (${dateDisplay}):

${lines}
─────────────
💰 Tổng: ${totalK}k đ

(${count} giao dịch)`

  await ctx.reply(message)
}

export async function handleWeek(ctx: Context): Promise<void> {
  const userId = ctx.from?.id
  if (!userId) return

  const { start, end } = getWeekBoundariesUTC()
  const { mon, sun } = getWeekRangeDisplay()

  let summaries: CategorySummary[]
  let count: number
  try {
    summaries = await queryWeekByCategory(userId, start, end)
    count = await queryTransactionCount(userId, start, end)
  } catch (err) {
    console.error('Week query error:', err)
    await ctx.reply('Có lỗi xảy ra, thử lại nhé 🙏')
    return
  }

  if (summaries.length === 0) {
    await ctx.reply('📊 Tuần này chưa có giao dịch nào.')
    return
  }

  const lines = formatSummaryLines(summaries)
  const total = totalAmount(summaries)
  const totalK = Math.round(total / 1000)

  const message = `📊 Tuần này (${mon} – ${sun}):

${lines}
─────────────
💰 Tổng: ${totalK}k đ

(${count} giao dịch)`

  await ctx.reply(message)
}
