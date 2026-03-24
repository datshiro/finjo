import { DateTime } from 'luxon'

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

/**
 * Returns current time in Vietnam timezone as ISO8601 string.
 */
export function getCurrentTimeVN(): string {
  return DateTime.now().setZone(VN_TIMEZONE).toISO()!
}

/**
 * Returns UTC boundaries for today in Vietnam time.
 * Used for WHERE date >= $1 AND date < $2 queries.
 */
export function getTodayBoundariesUTC(): { start: Date; end: Date } {
  const nowVN = DateTime.now().setZone(VN_TIMEZONE)
  const startVN = nowVN.startOf('day')
  const endVN = nowVN.endOf('day')

  return {
    start: startVN.toUTC().toJSDate(),
    end: endVN.toUTC().toJSDate(),
  }
}

/**
 * Returns UTC boundaries for the current week (Mon–Sun) in Vietnam time.
 */
export function getWeekBoundariesUTC(): { start: Date; end: Date } {
  const nowVN = DateTime.now().setZone(VN_TIMEZONE)
  const startVN = nowVN.startOf('week') // Luxon weeks start on Monday
  const endVN = nowVN.endOf('week')

  return {
    start: startVN.toUTC().toJSDate(),
    end: endVN.toUTC().toJSDate(),
  }
}

/**
 * Formats a Date as dd/MM for display (in VN timezone).
 */
export function formatDateVN(date: Date): string {
  return DateTime.fromJSDate(date).setZone(VN_TIMEZONE).toFormat('dd/MM')
}

/**
 * Returns Monday and Sunday of the current VN week formatted as dd/MM.
 */
export function getWeekRangeDisplay(): { mon: string; sun: string } {
  const nowVN = DateTime.now().setZone(VN_TIMEZONE)
  const startVN = nowVN.startOf('week')
  const endVN = nowVN.endOf('week')

  return {
    mon: startVN.toFormat('dd/MM'),
    sun: endVN.toFormat('dd/MM'),
  }
}

/**
 * Returns today's date formatted as dd/MM in VN timezone.
 */
export function getTodayDisplay(): string {
  return DateTime.now().setZone(VN_TIMEZONE).toFormat('dd/MM')
}
