import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @google/generative-ai before any imports that use it
vi.mock('@google/generative-ai', () => {
  const mockGenerateContent = vi.fn()
  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    generateContent: mockGenerateContent,
  })
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    _mockGenerateContent: mockGenerateContent,
  }
})


describe('parseExpense', () => {
  beforeEach(async () => {
    vi.resetModules()
    process.env.GEMINI_API_KEY = 'test-key'
  })

  it('parses "cafe sáng 45k" with k shorthand → 45000', async () => {
    const genAiMod = await import('@google/generative-ai')
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount_dong: 45000,
            currency: 'VND',
            category: 'food',
            description: 'cafe sáng',
            merchant: null,
            date: null,
          }),
      },
    })
    vi.mocked(genAiMod.GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
        }) as unknown as InstanceType<typeof genAiMod.GoogleGenerativeAI>,
    )

    const { parseExpense } = await import('../services/parser.js')
    const result = await parseExpense('cafe sáng 45k')

    expect(result).toMatchObject({
      amount_dong: 45000,
      currency: 'VND',
      category: 'food',
    })
  })

  it('parses "cafe 1.5tr" with tr shorthand → 1500000', async () => {
    const genAiMod = await import('@google/generative-ai')
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount_dong: 1500000,
            currency: 'VND',
            category: 'food',
            description: 'cafe',
            merchant: null,
            date: null,
          }),
      },
    })
    vi.mocked(genAiMod.GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
        }) as unknown as InstanceType<typeof genAiMod.GoogleGenerativeAI>,
    )

    const { parseExpense } = await import('../services/parser.js')
    const result = await parseExpense('cafe 1.5tr')

    expect(result).toMatchObject({
      amount_dong: 1500000,
      currency: 'VND',
      category: 'food',
    })
  })

  it('"Hello" input → error: not_an_expense', async () => {
    const genAiMod = await import('@google/generative-ai')
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify({ error: 'not_an_expense' }),
      },
    })
    vi.mocked(genAiMod.GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
        }) as unknown as InstanceType<typeof genAiMod.GoogleGenerativeAI>,
    )

    const { parseExpense } = await import('../services/parser.js')
    const result = await parseExpense('Hello')

    expect(result).toMatchObject({ error: 'not_an_expense' })
  })

  it('"50 USD lunch" → error: currency_not_supported', async () => {
    const genAiMod = await import('@google/generative-ai')
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify({ error: 'currency_not_supported' }),
      },
    })
    vi.mocked(genAiMod.GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
        }) as unknown as InstanceType<typeof genAiMod.GoogleGenerativeAI>,
    )

    const { parseExpense } = await import('../services/parser.js')
    const result = await parseExpense('50 USD lunch')

    expect(result).toMatchObject({ error: 'currency_not_supported' })
  })

  it('throws ZodError when LLM returns wrong type (amount_dong as string)', async () => {
    const genAiMod = await import('@google/generative-ai')
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount_dong: 'forty-five thousand', // wrong type — should be number
            currency: 'VND',
            category: 'food',
            description: 'cafe',
            merchant: null,
            date: null,
          }),
      },
    })
    vi.mocked(genAiMod.GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
        }) as unknown as InstanceType<typeof genAiMod.GoogleGenerativeAI>,
    )

    const { parseExpense } = await import('../services/parser.js')
    await expect(parseExpense('cafe 45k')).rejects.toThrow()
  })

  it('includes "Current time (Asia/Ho_Chi_Minh):" in the prompt sent to LLM', async () => {
    const genAiMod = await import('@google/generative-ai')
    const mockGenerateContent = vi.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            amount_dong: 45000,
            currency: 'VND',
            category: 'food',
            description: 'cafe',
            merchant: null,
            date: null,
          }),
      },
    })
    vi.mocked(genAiMod.GoogleGenerativeAI).mockImplementation(
      () =>
        ({
          getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
        }) as unknown as InstanceType<typeof genAiMod.GoogleGenerativeAI>,
    )

    const { parseExpense } = await import('../services/parser.js')
    await parseExpense('cafe 45k')

    expect(mockGenerateContent).toHaveBeenCalledOnce()
    const callArg = mockGenerateContent.mock.calls[0][0] as string
    expect(callArg).toContain('Current time (Asia/Ho_Chi_Minh):')
  })
})
