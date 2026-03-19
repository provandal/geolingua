import type React from 'react';

// ─── Language ───────────────────────────────────────────────

export interface LanguageEntry {
  code: string;           // BCP 47 tag: 'es', 'zh-TW', 'pt-BR'
  nativeName: string;     // 'Español', '中文', 'Português'
  englishName: string;    // 'Spanish', 'Chinese (Traditional)', 'Portuguese'
  speakers: number;       // For sort order
}

export interface CountryData {
  name: string;           // 'United States'
  hasSubdivisions: boolean;
  languages: LanguageEntry[];
}

export interface SubdivisionData {
  name: string;
  country: string;        // ISO 3166-1 alpha-2
  languages: LanguageEntry[];
}

export type CountryLanguageMap = Record<string, CountryData>;

// ─── Theme ──────────────────────────────────────────────────

export interface ThemeObject {
  background: string;
  globeOcean: string;
  globeLand: string;
  globeHover: string;
  globeSelected: string;
  panelBackground: string;
  panelBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  skipButton: string;
  sparkColor: string;
}

export type ThemePreset = 'fresco' | 'space' | 'minimal' | 'a11y';

// ─── Voice Detection ───────────────────────────────────────

export interface DetectionResult {
  language: string | null;
  nativeName?: string;
  englishName?: string;
  confidence: number;
  transcript?: string;
  tier: 1 | 2;
  provider?: 'browser' | 'whisper' | 'azure';
}

export type MicState = 'idle' | 'recording' | 'processing' | 'result' | 'error';

export interface VoiceDetectionConfig {
  provider?: 'whisper' | 'azure' | 'auto';
  openaiApiKey?: string;
  /** Custom endpoint for Whisper API (e.g., your server-side proxy). Overrides the default OpenAI URL. */
  whisperEndpoint?: string;
  azureApiKey?: string;
  azureRegion?: string;
}

// ─── Errors ─────────────────────────────────────────────────

export class GeoLinguaError extends Error {
  constructor(
    public code: string,
    public statusCode?: number,
  ) {
    super(`GeoLingua error: ${code}${statusCode ? ` (${statusCode})` : ''}`);
    this.name = 'GeoLinguaError';
  }
}

// ─── Dense Regions ──────────────────────────────────────────

export interface DenseRegion {
  id: string;
  label: string;
  bounds: { north: number; south: number; east: number; west: number };
  triggerZoomThreshold: number;
}

// ─── Display Mode ──────────────────────────────────────────

export type GeoLinguaMode = 'full' | 'icon';

export interface GeoLinguaTriggerProps {
  onClick: () => void;
  isExpanded: boolean;
  selectedLocale: string | null;
}

// ─── Component Props ────────────────────────────────────────

export interface GeoLinguaProps {
  onLanguageSelect: (locale: string) => void;
  appName?: string;
  theme?: ThemePreset | ThemeObject;
  showSkip?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
  welcomePhrases?: Partial<Record<string, string>>;
  rotationSpeed?: number;
  customLanguageData?: Partial<CountryLanguageMap>;
  maxLanguagesShown?: number;
  persist?: boolean;
  storageKey?: string;
  onReady?: () => void;
  onError?: (error: GeoLinguaError) => void;
  globeAriaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
  voiceDetectionEnabled?: boolean;
  voiceDetection?: VoiceDetectionConfig;
  onVoiceDetection?: (result: DetectionResult) => void;

  /** Display mode. 'icon' renders a small trigger that expands to show the globe. Default: 'full'. */
  initialMode?: GeoLinguaMode;
  /** Auto-collapse back to icon after language selection. Default: true. */
  autoCollapseOnSelect?: boolean;
  /** Custom trigger element for icon mode. */
  renderTrigger?: (props: GeoLinguaTriggerProps) => React.ReactNode;
  /** Auto-detect browser/system language and show a suggestion. Default: true. */
  detectBrowserLanguage?: boolean;
  /** URL of the icon image used by the default trigger in icon mode and by CreationGlobeIcon. */
  iconSrc?: string;
}

// ─── RTL ────────────────────────────────────────────────────

export const RTL_LANGUAGES = [
  'ar', 'ar-LB', 'ar-EG', 'ar-SA', 'ar-MA',
  'he', 'fa', 'ur', 'yi', 'dv', 'ps',
];

export function isRTL(locale: string): boolean {
  return RTL_LANGUAGES.some(
    (rtl) => locale === rtl || locale.startsWith(rtl + '-'),
  );
}
