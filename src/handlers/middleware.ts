import { type Context, type NextFunction } from 'grammy'

function getAllowedChatIds(): Set<string> {
  const raw = process.env.ALLOWED_CHAT_IDS ?? ''
  return new Set(
    raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  )
}

export async function authMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const chatId = ctx.chat?.id?.toString()

  if (!chatId) {
    // No chat context — silently drop
    return
  }

  const allowed = getAllowedChatIds()

  if (!allowed.has(chatId)) {
    console.log(
      `Unknown sender dropped: chatId=${chatId} ts=${new Date().toISOString()}`,
    )
    return
  }

  await next()
}
