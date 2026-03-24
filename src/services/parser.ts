import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCurrentTimeVN } from '../utils/time.js'
import { LLMResponseSchema, type LLMResponse } from '../schemas/transaction.js'

const SYSTEM_PROMPT = `You are a Vietnamese expense parser. Extract expense data from the user input.
Always respond in Vietnamese. Return ONLY valid JSON — no markdown, no explanation.
If the input is not an expense, return: {"error": "not_an_expense"}
If the amount is ambiguous or missing, return: {"error": "needs_clarification", "message": "..."}
Vietnamese shorthand: "k" = ×1000, "tr" = ×1,000,000. Examples: "45k" = 45000, "1.5tr" = 1500000.
Relative dates: resolve "hôm qua" (yesterday), "tối qua" (last night), "sáng nay" (this morning)
against the CURRENT TIME provided below before returning ISO8601.
Only support VND. If non-VND detected, return: {"error": "currency_not_supported"}`

function buildUserMessage(rawInput: string, currentTimeVN: string): string {
  return `Current time (Asia/Ho_Chi_Minh): ${currentTimeVN}
${rawInput}`
}

export async function parseExpense(
  rawInput: string,
  apiKey?: string,
): Promise<LLMResponse> {
  const key = apiKey ?? process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const currentTimeVN = getCurrentTimeVN()
  const userMessage = buildUserMessage(rawInput, currentTimeVN)

  const result = await model.generateContent(userMessage)
  const text = result.response.text()

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`LLM returned invalid JSON: ${text}`)
  }

  return LLMResponseSchema.parse(parsed)
}
