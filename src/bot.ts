import { Bot } from 'grammy'
import { authMiddleware } from './handlers/middleware.js'
import { handleMessage } from './handlers/message.js'
import { handleStart, handleToday, handleWeek } from './handlers/commands.js'

export function createBot(): Bot {
  const token = process.env.BOT_TOKEN
  if (!token) {
    throw new Error('BOT_TOKEN is not set')
  }

  const bot = new Bot(token)

  // Auth middleware applied to all updates
  bot.use(authMiddleware)

  // Commands
  bot.command('start', handleStart)
  bot.command('today', handleToday)
  bot.command('week', handleWeek)

  // Text messages
  bot.on('message:text', handleMessage)

  bot.catch((err) => {
    console.error('Bot error:', err)
  })

  return bot
}
