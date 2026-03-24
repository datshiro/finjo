import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DateTime } from 'luxon'

// We test time utilities by mocking the system clock via vi.setSystemTime

describe('time utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getTodayBoundariesUTC', () => {
    it('at 23:59 VN time returns correct UTC boundaries for that VN day', async () => {
      // Set clock to 2024-01-15 23:59:00 in Asia/Ho_Chi_Minh (UTC+7 = 16:59:00 UTC)
      const vnTime = DateTime.fromObject(
        { year: 2024, month: 1, day: 15, hour: 23, minute: 59, second: 0 },
        { zone: 'Asia/Ho_Chi_Minh' },
      )
      vi.setSystemTime(vnTime.toJSDate())

      const { getTodayBoundariesUTC } = await import('../utils/time.js')
      const { start, end } = getTodayBoundariesUTC()

      // Start of 2024-01-15 VN = 2024-01-14 17:00:00 UTC
      const expectedStart = DateTime.fromObject(
        { year: 2024, month: 1, day: 15, hour: 0, minute: 0, second: 0 },
        { zone: 'Asia/Ho_Chi_Minh' },
      ).toUTC().toJSDate()

      // End of 2024-01-15 VN = 2024-01-15 16:59:59.999 UTC
      const expectedEnd = DateTime.fromObject(
        { year: 2024, month: 1, day: 15, hour: 23, minute: 59, second: 59, millisecond: 999 },
        { zone: 'Asia/Ho_Chi_Minh' },
      ).toUTC().toJSDate()

      expect(start.toISOString()).toBe(expectedStart.toISOString())
      expect(end.getTime()).toBeCloseTo(expectedEnd.getTime(), -2)
    })

    it('at 00:01 VN time returns correct UTC boundaries for that VN day', async () => {
      // Set clock to 2024-01-16 00:01:00 in Asia/Ho_Chi_Minh
      const vnTime = DateTime.fromObject(
        { year: 2024, month: 1, day: 16, hour: 0, minute: 1, second: 0 },
        { zone: 'Asia/Ho_Chi_Minh' },
      )
      vi.setSystemTime(vnTime.toJSDate())

      const { getTodayBoundariesUTC } = await import('../utils/time.js')
      const { start, end } = getTodayBoundariesUTC()

      // Start of 2024-01-16 VN = 2024-01-15 17:00:00 UTC
      const expectedStart = DateTime.fromObject(
        { year: 2024, month: 1, day: 16, hour: 0, minute: 0, second: 0 },
        { zone: 'Asia/Ho_Chi_Minh' },
      ).toUTC().toJSDate()

      expect(start.toISOString()).toBe(expectedStart.toISOString())
      // End should be 2024-01-16 VN end
      const startVN = DateTime.fromJSDate(start).setZone('Asia/Ho_Chi_Minh')
      const endVN = DateTime.fromJSDate(end).setZone('Asia/Ho_Chi_Minh')
      expect(startVN.day).toBe(16)
      expect(endVN.day).toBe(16)
    })
  })

  describe('getWeekBoundariesUTC', () => {
    it('on Monday returns start = that Monday 00:00 VN', async () => {
      // 2024-01-15 is a Monday
      const vnTime = DateTime.fromObject(
        { year: 2024, month: 1, day: 15, hour: 10, minute: 0 },
        { zone: 'Asia/Ho_Chi_Minh' },
      )
      vi.setSystemTime(vnTime.toJSDate())

      const { getWeekBoundariesUTC } = await import('../utils/time.js')
      const { start } = getWeekBoundariesUTC()

      const startVN = DateTime.fromJSDate(start).setZone('Asia/Ho_Chi_Minh')
      // Monday start
      expect(startVN.weekday).toBe(1) // Monday
      expect(startVN.hour).toBe(0)
      expect(startVN.minute).toBe(0)
      expect(startVN.day).toBe(15)
    })

    it('on Sunday returns end = that Sunday 23:59:59 VN', async () => {
      // 2024-01-21 is a Sunday
      const vnTime = DateTime.fromObject(
        { year: 2024, month: 1, day: 21, hour: 20, minute: 0 },
        { zone: 'Asia/Ho_Chi_Minh' },
      )
      vi.setSystemTime(vnTime.toJSDate())

      const { getWeekBoundariesUTC } = await import('../utils/time.js')
      const { end } = getWeekBoundariesUTC()

      const endVN = DateTime.fromJSDate(end).setZone('Asia/Ho_Chi_Minh')
      expect(endVN.weekday).toBe(7) // Sunday
      expect(endVN.hour).toBe(23)
      expect(endVN.minute).toBe(59)
      expect(endVN.day).toBe(21)
    })
  })
})
