import { COUNTRY_LANGUAGES } from '../data/languages';

// Build a flat lookup: language code → { nativeName, englishName }
const LANGUAGE_NAMES: Record<string, { nativeName: string; englishName: string }> = {};
for (const country of Object.values(COUNTRY_LANGUAGES)) {
  for (const lang of country.languages) {
    if (!LANGUAGE_NAMES[lang.code]) {
      LANGUAGE_NAMES[lang.code] = { nativeName: lang.nativeName, englishName: lang.englishName };
    }
  }
}

export function lookupLanguageName(code: string): { nativeName: string; englishName: string } | null {
  if (LANGUAGE_NAMES[code]) return LANGUAGE_NAMES[code];
  const base = code.split('-')[0];
  if (LANGUAGE_NAMES[base]) return LANGUAGE_NAMES[base];
  const match = Object.entries(LANGUAGE_NAMES).find(([k]) => k.startsWith(base + '-'));
  return match ? match[1] : null;
}

/** Get all unique languages across all countries (deduplicated by code). */
export function getAllLanguages(): { code: string; nativeName: string; englishName: string }[] {
  return Object.entries(LANGUAGE_NAMES).map(([code, names]) => ({
    code,
    ...names,
  }));
}
