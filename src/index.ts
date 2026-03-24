import { createServer } from 'http'
import { webhookCallback } from 'grammy'
import { createBot } from './bot.js'

const PORT = parseInt(process.env.PORT ?? '3000', 10)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? ''

const bot = createBot()

const handleUpdate = webhookCallback(bot, 'http')

const server = createServer(async (req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  // Webhook endpoint
  if (req.method === 'POST' && req.url === '/webhook') {
    // Verify webhook secret token
    if (WEBHOOK_SECRET) {
      const secretHeader = req.headers['x-telegram-bot-api-secret-token']
      if (secretHeader !== WEBHOOK_SECRET) {
        res.writeHead(401, { 'Content-Type': 'text/plain' })
        res.end('Unauthorized')
        return
      }
    }

    try {
      await handleUpdate(req, res)
    } catch (err) {
      console.error('Webhook handler error:', err)
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Internal Server Error')
    }
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not Found')
})

server.listen(PORT, () => {
  console.log(`Finjo bot webhook server listening on port ${PORT}`)

  // Register webhook if domain is configured
  const domain = process.env.WEBHOOK_DOMAIN
  if (domain && process.env.BOT_TOKEN) {
    const webhookUrl = `${domain}/webhook`
    bot.api
      .setWebhook(webhookUrl, {
        secret_token: WEBHOOK_SECRET || undefined,
      })
      .then(() => {
        console.log(`Webhook registered: ${webhookUrl}`)
      })
      .catch((err) => {
        console.error('Failed to register webhook:', err)
      })
  }
})

export { bot, server }
