export const currencyToCountry = {
  USD: { country: 'US', flag: '🇺🇸' },
  EUR: { country: 'EU', flag: '🇪🇺' },
  GBP: { country: 'GB', flag: '🇬🇧' },
  JPY: { country: 'JP', flag: '🇯🇵' },
} as const;

export const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}; 