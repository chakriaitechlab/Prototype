const COUNTRIES = [
  { dialCode: '880', flag: '🇧🇩', name: 'Bangladesh' },
  { dialCode: '91', flag: '🇮🇳', name: 'India' },
] as const;

const [DEFAULT_COUNTRY] = COUNTRIES;

export function phoneCountry(phoneNumber: string | null) {
  return COUNTRIES.find(({ dialCode }) => phoneNumber?.startsWith(dialCode)) ?? DEFAULT_COUNTRY;
}

/** Stored numbers are digits with country code (e.g. 8801712345678) → "+880 1712345678". */
export function formatPhone(phoneNumber: string) {
  const { dialCode } = phoneCountry(phoneNumber);
  return phoneNumber.startsWith(dialCode)
    ? `+${dialCode} ${phoneNumber.slice(dialCode.length)}`
    : `+${phoneNumber}`;
}
