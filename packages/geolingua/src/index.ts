// Main component
export { GeoLingua, CreationGlobeIcon } from './GeoLingua';

// Sub-components
export { Globe } from './Globe';
export { LanguageList } from './LanguageList';
export { LanguageSearch } from './LanguageSearch';
export { VoiceButton } from './VoiceButton';

// Headless hook
export { useGeoLingua } from './useGeoLingua';
export type { UseGeoLinguaOptions } from './useGeoLingua';

// Themes
export { frescoTheme, spaceTheme, minimalTheme, a11yTheme, resolveTheme } from './themes';

// Data utilities
export { getLanguagesForCountry, COUNTRY_LANGUAGES } from './data/languages';
export { getLanguagesForSubdivision, SUBDIVISION_LANGUAGES } from './data/subdivisions';
export { getWelcomePhrase, DEFAULT_WELCOME_PHRASES } from './data/welcomePhrases';
export { DENSE_REGIONS, isInDenseRegion } from './data/denseRegions';

// Language name utilities
export { lookupLanguageName, getAllLanguages } from './utils/languageNames';

// Voice detection
export {
  detectLanguageWhisper,
  detectLanguageAzure,
  createLiveDetector,
  analyzeTranscript,
  runDetection,
  getSupportedMimeType,
} from './voice/detection';
export type { LiveDetector } from './voice/detection';

// Types
export type {
  GeoLinguaProps,
  ThemeObject,
  ThemePreset,
  LanguageEntry,
  CountryData,
  SubdivisionData,
  CountryLanguageMap,
  DetectionResult,
  MicState,
  VoiceDetectionConfig,
  DenseRegion,
  GeoLinguaMode,
  GeoLinguaTriggerProps,
} from './types';

export { GeoLinguaError, isRTL, RTL_LANGUAGES } from './types';
