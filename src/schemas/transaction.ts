import { z } from 'zod'

export const LLMSuccessSchema = z.object({
  amount_dong: z.number().int().positive(),
  currency: z.literal('VND'),
  category: z.enum([
    'food',
    'transport',
    'entertainment',
    'health',
    'shopping',
    'utilities',
    'housing',
    'other',
  ]),
  description: z.string().min(1),
  merchant: z.string().nullable(),
  date: z.string().nullable(), // ISO8601 in Asia/Ho_Chi_Minh — converted to UTC before insert
})

export const LLMErrorSchema = z.object({
  error: z.enum(['not_an_expense', 'needs_clarification', 'currency_not_supported']),
  message: z.string().optional(),
})

export const LLMResponseSchema = z.union([LLMSuccessSchema, LLMErrorSchema])

export type LLMSuccess = z.infer<typeof LLMSuccessSchema>
export type LLMError = z.infer<typeof LLMErrorSchema>
export type LLMResponse = z.infer<typeof LLMResponseSchema>

export const DBInsertSchema = z.object({
  user_id: z.number().int(),
  amount_dong: z.number().int().positive(),
  currency: z.literal('VND'),
  category: z.string(),
  description: z.string().min(1),
  merchant: z.string().nullable().optional(),
  date: z.string(), // UTC ISO8601
  source: z.string().default('text'),
  raw_input: z.string(),
  telegram_message_id: z.number().int(),
})

export type DBInsert = z.infer<typeof DBInsertSchema>

export type Category =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'utilities'
  | 'housing'
  | 'other'

export const CATEGORY_EMOJI: Record<Category, string> = {
  food: '🍜',
  transport: '🚗',
  entertainment: '🎮',
  health: '💊',
  shopping: '🛍️',
  utilities: '💡',
  housing: '🏠',
  other: '📦',
}
