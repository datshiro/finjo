import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authMiddleware } from '../handlers/middleware.js'
import { type Context } from 'grammy'

function makeCtx(chatId: number | undefined): Context {
  return {
    chat: chatId !== undefined ? { id: chatId } : undefined,
    reply: vi.fn(),
    from: { id: chatId ?? 0 },
  } as unknown as Context
}

describe('authMiddleware', () => {
  const next = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows through an allowed chat ID', async () => {
    process.env.ALLOWED_CHAT_IDS = '123456789,987654321'

    const ctx = makeCtx(123456789)
    await authMiddleware(ctx, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('drops (does not call next) for an unknown chat ID', async () => {
    process.env.ALLOWED_CHAT_IDS = '123456789'
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const ctx = makeCtx(999999999)
    await authMiddleware(ctx, next)

    expect(next).not.toHaveBeenCalled()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown sender dropped: chatId=999999999'),
    )

    consoleSpy.mockRestore()
  })

  it('does not send a reply for unknown senders', async () => {
    process.env.ALLOWED_CHAT_IDS = '123456789'
    vi.spyOn(console, 'log').mockImplementation(() => {})

    const ctx = makeCtx(999999999)
    await authMiddleware(ctx, next)

    expect((ctx.reply as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('drops silently when chat is undefined', async () => {
    process.env.ALLOWED_CHAT_IDS = '123456789'

    const ctx = makeCtx(undefined)
    await authMiddleware(ctx, next)

    expect(next).not.toHaveBeenCalled()
  })
})
