import { type Context } from 'grammy'
import { parseExpense } from '../services/parser.js'
import { insertTransaction } from '../services/db.js'
import { CATEGORY_EMOJI, type Category } from '../schemas/transaction.js'
import { DateTime } from 'luxon'

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

function formatConfirmation(
  category: Category,
  amountDong: number,
  description: string,
  id: number,
): string {
  const emoji = CATEGORY_EMOJI[category]
  const amountK = Math.round(amountDong / 1000)
  return `✅ ${emoji} ${category} — ${amountK}k đ\n📝 ${description}\n🆔 #${id}`
}

export async function handleMessage(ctx: Context): Promise<void> {
  const text = ctx.message?.text
  const userId = ctx.from?.id
  const messageId = ctx.message?.message_id

  if (!text || !userId || !messageId) return

  let parsed
  try {
    parsed = await parseExpense(text)
  } catch (err) {
    console.error('Parser error:', err)
    await ctx.reply('Tôi không hiểu, bạn có thể nói rõ hơn không? (ví dụ: "cafe 45k")')
    return
  }

  // Handle LLM error responses
  if ('error' in parsed) {
    switch (parsed.error) {
      case 'not_an_expense':
        await ctx.reply('Tôi không hiểu, bạn có thể nói rõ hơn không? (ví dụ: "cafe 45k")')
        return
      case 'needs_clarification':
        await ctx.reply(
          parsed.message ?? 'Bạn có thể nói rõ số tiền không?',
        )
        return
      case 'currency_not_supported':
        await ctx.reply('Hiện tại chỉ hỗ trợ VND. Bạn có thể quy đổi sang VND không?')
        return
    }
  }

  // Parse the date: convert from VN timezone to UTC
  let dateUTC: string
  if (parsed.date) {
    // Date from LLM is in Asia/Ho_Chi_Minh — convert to UTC
    const dt = DateTime.fromISO(parsed.date, { zone: VN_TIMEZONE })
    dateUTC = dt.toUTC().toISO()!
  } else {
    // Default to current time
    dateUTC = DateTime.now().toUTC().toISO()!
  }

  let row
  try {
    row = await insertTransaction({
      user_id: userId,
      amount_dong: parsed.amount_dong,
      currency: 'VND',
      category: parsed.category,
      description: parsed.description,
      merchant: parsed.merchant ?? null,
      date: dateUTC,
      source: 'text',
      raw_input: text,
      telegram_message_id: messageId,
    })
  } catch (err) {
    console.error('DB insert error:', err)
    await ctx.reply('Có lỗi xảy ra, thử lại nhé 🙏')
    return
  }

  const confirmation = formatConfirmation(
    parsed.category as Category,
    parsed.amount_dong,
    parsed.description,
    row.id,
  )
  await ctx.reply(confirmation)
}
