const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const SOON_DAYS = 3;

export function toBengaliNumber(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

/** e.g. "21 Oct 2026", in Dhaka time. */
export function formatBanglaDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'প্রযোজ্য নয়';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' });
}

type DeadlineTone = 'expired' | 'soon' | 'open';

/** `now` is passed in so server and client render the same text. */
export function deadlineStatus(iso: string, now: number): { tone: DeadlineTone; text: string } {
  const remaining = new Date(iso).getTime() - now;
  if (remaining <= 0) return { tone: 'expired', text: 'আবেদনের সময় শেষ' };

  const days = Math.ceil(remaining / DAY_MS);
  if (days === 1) {
    return { tone: 'soon', text: `আজ শেষ (${toBengaliNumber(Math.ceil(remaining / HOUR_MS))} ঘণ্টা বাকি)` };
  }
  return { tone: days <= SOON_DAYS ? 'soon' : 'open', text: `${toBengaliNumber(days)} দিন বাকি` };
}
