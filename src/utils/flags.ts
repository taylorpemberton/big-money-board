export const currencyToCountry: Record<string, { name: string; flag: string }> = {
  USD: { name: 'United States', flag: '🇺🇸' },
  EUR: { name: 'European Union', flag: '🇪🇺' },
  GBP: { name: 'United Kingdom', flag: '🇬🇧' },
  JPY: { name: 'Japan', flag: '🇯🇵' },
  CAD: { name: 'Canada', flag: '🇨🇦' },
  AUD: { name: 'Australia', flag: '🇦🇺' },
  INR: { name: 'India', flag: '🇮🇳' },
  CNY: { name: 'China', flag: '🇨🇳' },
  BRL: { name: 'Brazil', flag: '🇧🇷' },
  KRW: { name: 'South Korea', flag: '🇰🇷' }
};

export const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}; 