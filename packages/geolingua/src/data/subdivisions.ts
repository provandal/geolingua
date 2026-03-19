// Subdivision-level language data — ISO 3166-2 codes
// REVIEW: Subdivision boundary accuracy, speaker count accuracy

import type { SubdivisionData } from '../types';

export const SUBDIVISION_LANGUAGES: Record<string, SubdivisionData> = {
  // ─── Canada ───────────────────────────────────────────────
  'CA-QC': {
    name: 'Quebec', country: 'CA', languages: [
      { code: 'fr', nativeName: 'Français', englishName: 'French', speakers: 6100000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 900000 },
    ],
  },
  'CA-BC': {
    name: 'British Columbia', country: 'CA', languages: [
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 3700000 },
      { code: 'zh', nativeName: '中文', englishName: 'Chinese', speakers: 500000 },
      { code: 'fr', nativeName: 'Français', englishName: 'French', speakers: 70000 },
    ],
  },

  // ─── India ────────────────────────────────────────────────
  'IN-TN': {
    name: 'Tamil Nadu', country: 'IN', languages: [
      { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', speakers: 63000000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 5000000 },
    ],
  },
  'IN-KA': {
    name: 'Karnataka', country: 'IN', languages: [
      { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', speakers: 44000000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 4000000 },
    ],
  },
  'IN-KL': {
    name: 'Kerala', country: 'IN', languages: [
      { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', speakers: 33000000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 2000000 },
    ],
  },
  'IN-MH': {
    name: 'Maharashtra', country: 'IN', languages: [
      { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', speakers: 83000000 },
      { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', speakers: 5000000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 4000000 },
    ],
  },
  'IN-GJ': {
    name: 'Gujarat', country: 'IN', languages: [
      { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', speakers: 56000000 },
      { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', speakers: 2000000 },
    ],
  },
  'IN-WB': {
    name: 'West Bengal', country: 'IN', languages: [
      { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', speakers: 80000000 },
      { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', speakers: 2000000 },
    ],
  },
  'IN-PB': {
    name: 'Punjab', country: 'IN', languages: [
      { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', speakers: 28000000 },
      { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', speakers: 1000000 },
    ],
  },

  // ─── China ────────────────────────────────────────────────
  'CN-GD': {
    name: 'Guangdong', country: 'CN', languages: [
      { code: 'yue', nativeName: '粵語', englishName: 'Cantonese', speakers: 80000000 },
      { code: 'zh', nativeName: '普通話', englishName: 'Mandarin', speakers: 10000000 },
    ],
  },
  'CN-HK': {
    name: 'Hong Kong', country: 'CN', languages: [
      { code: 'yue', nativeName: '粵語', englishName: 'Cantonese', speakers: 6000000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 2000000 },
      { code: 'zh', nativeName: '普通話', englishName: 'Mandarin', speakers: 1000000 },
    ],
  },
  'CN-MO': {
    name: 'Macao', country: 'CN', languages: [
      { code: 'yue', nativeName: '粵語', englishName: 'Cantonese', speakers: 430000 },
      { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', speakers: 30000 },
    ],
  },

  // ─── Spain ────────────────────────────────────────────────
  'ES-CT': {
    name: 'Catalonia', country: 'ES', languages: [
      { code: 'ca', nativeName: 'Català', englishName: 'Catalan', speakers: 4000000 },
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 4000000 },
    ],
  },
  'ES-PV': {
    name: 'Basque Country', country: 'ES', languages: [
      { code: 'eu', nativeName: 'Euskara', englishName: 'Basque', speakers: 750000 },
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 2000000 },
    ],
  },
  'ES-GL': {
    name: 'Galicia', country: 'ES', languages: [
      { code: 'gl', nativeName: 'Galego', englishName: 'Galician', speakers: 2000000 },
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 600000 },
    ],
  },

  // ─── Belgium ──────────────────────────────────────────────
  'BE-VLG': {
    name: 'Flanders', country: 'BE', languages: [
      { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', speakers: 6500000 },
      { code: 'fr', nativeName: 'Français', englishName: 'French', speakers: 200000 },
    ],
  },
  'BE-WAL': {
    name: 'Wallonia', country: 'BE', languages: [
      { code: 'fr', nativeName: 'Français', englishName: 'French', speakers: 3500000 },
      { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', speakers: 100000 },
    ],
  },

  // ─── Switzerland ──────────────────────────────────────────
  'CH-ZH': {
    name: 'Zurich', country: 'CH', languages: [
      { code: 'de', nativeName: 'Deutsch', englishName: 'German', speakers: 1000000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 200000 },
    ],
  },
  'CH-GE': {
    name: 'Geneva', country: 'CH', languages: [
      { code: 'fr', nativeName: 'Français', englishName: 'French', speakers: 450000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 150000 },
    ],
  },

  // ─── Russia ───────────────────────────────────────────────
  'RU-TA': {
    name: 'Tatarstan', country: 'RU', languages: [
      { code: 'tt', nativeName: 'Татар теле', englishName: 'Tatar', speakers: 3700000 },
      { code: 'ru', nativeName: 'Русский', englishName: 'Russian', speakers: 3700000 },
    ],
  },
  'RU-CE': {
    name: 'Chechnya', country: 'RU', languages: [
      { code: 'ce', nativeName: 'Нохчийн мотт', englishName: 'Chechen', speakers: 1400000 },
      { code: 'ru', nativeName: 'Русский', englishName: 'Russian', speakers: 400000 },
    ],
  },

  // ─── USA ──────────────────────────────────────────────────
  'US-CA': {
    name: 'California', country: 'US', languages: [
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 24000000 },
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 10000000 },
      { code: 'zh', nativeName: '中文', englishName: 'Chinese', speakers: 1200000 },
      { code: 'tl', nativeName: 'Tagalog', englishName: 'Tagalog', speakers: 800000 },
      { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', speakers: 600000 },
    ],
  },
  'US-TX': {
    name: 'Texas', country: 'US', languages: [
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 17000000 },
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 9000000 },
      { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', speakers: 250000 },
    ],
  },
  'US-FL': {
    name: 'Florida', country: 'US', languages: [
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 14000000 },
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 4500000 },
      { code: 'ht', nativeName: 'Kreyòl ayisyen', englishName: 'Haitian Creole', speakers: 300000 },
      { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', speakers: 200000 },
    ],
  },
  'US-NY': {
    name: 'New York', country: 'US', languages: [
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 13000000 },
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 3600000 },
      { code: 'zh', nativeName: '中文', englishName: 'Chinese', speakers: 700000 },
      { code: 'ru', nativeName: 'Русский', englishName: 'Russian', speakers: 500000 },
    ],
  },
  'US-HI': {
    name: 'Hawaii', country: 'US', languages: [
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 980000 },
      { code: 'haw', nativeName: 'ʻŌlelo Hawaiʻi', englishName: 'Hawaiian', speakers: 18000 },
      { code: 'tl', nativeName: 'Tagalog', englishName: 'Tagalog', speakers: 75000 },
      { code: 'ja', nativeName: '日本語', englishName: 'Japanese', speakers: 65000 },
    ],
  },
  'US-PR': {
    name: 'Puerto Rico', country: 'US', languages: [
      { code: 'es', nativeName: 'Español', englishName: 'Spanish', speakers: 3100000 },
      { code: 'en', nativeName: 'English', englishName: 'English', speakers: 800000 },
    ],
  },
};

export function getLanguagesForSubdivision(subdivisionCode: string): SubdivisionData | null {
  return SUBDIVISION_LANGUAGES[subdivisionCode] ?? null;
}
