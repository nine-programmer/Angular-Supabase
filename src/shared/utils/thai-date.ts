// "Today" in Thailand for date rules (due dates, overdue, daily queues) — plain TS, safe in browser, SSR, and Node.
export const THAI_TIME_ZONE = 'Asia/Bangkok';

// en-CA formats as YYYY-MM-DD: the same shape as a Postgres `date` column and <input type="date">.
const isoDateInThailand = new Intl.DateTimeFormat('en-CA', {
  timeZone: THAI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Calendar date in Thailand as 'YYYY-MM-DD' — mirrors `(now() at time zone 'Asia/Bangkok')::date` in SQL. */
export function todayInThailand(now: Date = new Date()): string {
  return isoDateInThailand.format(now);
}

/** True when `isoDate` (YYYY-MM-DD) is earlier than today in Thailand; ISO dates compare correctly as text. */
export function isBeforeToday(isoDate: string, now: Date = new Date()): boolean {
  return isoDate < todayInThailand(now);
}

/** Whole days from today in Thailand to `isoDate` (negative = in the past; NaN when `isoDate` is not YYYY-MM-DD). */
export function daysFromToday(isoDate: string, now: Date = new Date()): number {
  const today = Date.UTC(...parts(todayInThailand(now)));
  const target = Date.UTC(...parts(isoDate));
  return Math.round((target - today) / 86_400_000);
}

function parts(iso: string): [number, number, number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m - 1, d];
}
