// Verifies Thai-timezone date arithmetic used by due-date / overdue rules.
import { daysFromToday, isBeforeToday, todayInThailand } from './thai-date';

describe('thai-date', () => {
  // 20:30 UTC on 28 Aug = 03:30 on 29 Aug in Bangkok (UTC+7).
  const lateEveningUtc = new Date('2026-08-28T20:30:00Z');

  it('rolls over at Thai midnight, not UTC midnight', () => {
    expect(todayInThailand(lateEveningUtc)).toBe('2026-08-29');
    expect(todayInThailand(new Date('2026-08-28T16:59:00Z'))).toBe('2026-08-28');
  });

  it('compares ISO dates against Thai today', () => {
    expect(isBeforeToday('2026-08-28', lateEveningUtc)).toBe(true);
    expect(isBeforeToday('2026-08-29', lateEveningUtc)).toBe(false);
  });

  it('counts whole days from Thai today', () => {
    expect(daysFromToday('2026-09-01', lateEveningUtc)).toBe(3);
    expect(daysFromToday('2026-08-29', lateEveningUtc)).toBe(0);
    expect(daysFromToday('2026-08-27', lateEveningUtc)).toBe(-2);
  });
});
