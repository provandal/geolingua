import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ThemeObject, CountryData, CountryLanguageMap } from './types';
import type { ThemePreset } from './types';
import { resolveTheme } from './themes';
import { COUNTRY_LANGUAGES } from './data/languages';
import { getWelcomePhrase } from './data/welcomePhrases';
import { lookupLanguageName } from './utils/languageNames';

interface GeoLinguaState {
  selectedCountry: string | null;
  selectedCountryName: string | null;
  hoveredCountry: string | null;
  hoveredCountryName: string | null;
  selectedLanguage: string | null;
  suggestedLanguage: string | null;
  view: 'globe' | 'flatmap' | 'result';
}

type Action =
  | { type: 'HOVER_COUNTRY'; iso: string | null; name: string | null }
  | { type: 'SELECT_COUNTRY'; iso: string; name: string }
  | { type: 'SELECT_LANGUAGE'; locale: string }
  | { type: 'INIT_LANGUAGE'; locale: string }
  | { type: 'SUGGEST_LANGUAGE'; locale: string }
  | { type: 'DISMISS_SUGGESTION' }
  | { type: 'SET_VIEW'; view: 'globe' | 'flatmap' | 'result' }
  | { type: 'RESET' };

function reducer(state: GeoLinguaState, action: Action): GeoLinguaState {
  switch (action.type) {
    case 'HOVER_COUNTRY':
      return { ...state, hoveredCountry: action.iso, hoveredCountryName: action.name };
    case 'SELECT_COUNTRY':
      return {
        ...state,
        selectedCountry: action.iso,
        selectedCountryName: action.name,
        selectedLanguage: null,
        view: 'globe',
      };
    case 'SELECT_LANGUAGE':
      return { ...state, selectedLanguage: action.locale, suggestedLanguage: null, view: 'result' };
    case 'INIT_LANGUAGE':
      // Set the language without transitioning to result view — used for
      // localStorage restore and browser language auto-detection on mount.
      return { ...state, selectedLanguage: action.locale, suggestedLanguage: null };
    case 'SUGGEST_LANGUAGE':
      return { ...state, suggestedLanguage: action.locale };
    case 'DISMISS_SUGGESTION':
      return { ...state, suggestedLanguage: null };
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'RESET':
      return {
        selectedCountry: null,
        selectedCountryName: null,
        hoveredCountry: null,
        hoveredCountryName: null,
        selectedLanguage: null,
        suggestedLanguage: null,
        view: 'globe',
      };
    default:
      return state;
  }
}

export interface UseGeoLinguaOptions {
  appName?: string;
  theme?: ThemePreset | ThemeObject;
  onLanguageSelect?: (locale: string) => void;
  persist?: boolean;
  storageKey?: string;
  customLanguageData?: Partial<CountryLanguageMap>;
  welcomePhrases?: Partial<Record<string, string>>;
  detectBrowserLanguage?: boolean;
}

export function useGeoLingua(options: UseGeoLinguaOptions = {}) {
  const {
    appName = 'this app',
    theme,
    onLanguageSelect,
    persist = true,
    storageKey = 'geolingua_locale',
    customLanguageData,
    welcomePhrases,
    detectBrowserLanguage = true,
  } = options;

  const resolvedTheme = useMemo(() => resolveTheme(theme), [theme]);
  const hasInitRef = useRef(false);

  // Merge custom language data with built-in data
  const mergedLanguages = useMemo<CountryLanguageMap>(() => {
    if (!customLanguageData) return COUNTRY_LANGUAGES;
    const merged = { ...COUNTRY_LANGUAGES };
    for (const [iso, data] of Object.entries(customLanguageData)) {
      if (data) {
        if (merged[iso]) {
          merged[iso] = {
            ...merged[iso],
            ...data,
            languages: data.languages ?? merged[iso].languages,
          };
        } else {
          merged[iso] = data as CountryData;
        }
      }
    }
    return merged;
  }, [customLanguageData]);

  const [state, dispatch] = useReducer(reducer, {
    selectedCountry: null,
    selectedCountryName: null,
    hoveredCountry: null,
    hoveredCountryName: null,
    selectedLanguage: null,
    suggestedLanguage: null,
    view: 'globe',
  });

  // On mount: auto-restore persisted locale, or auto-detect browser language.
  // Uses INIT_LANGUAGE (not SELECT_LANGUAGE) so the component stays on the
  // globe/icon view instead of jumping straight to the result screen.
  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;

    // Check localStorage first
    if (persist && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          dispatch({ type: 'INIT_LANGUAGE', locale: stored });
          onLanguageSelect?.(stored);
          return;
        }
      } catch { /* ignore */ }
    }

    // Auto-detect browser/system language and select it
    if (detectBrowserLanguage && typeof navigator !== 'undefined') {
      const browserLang = navigator.language; // e.g., "en-US"
      const base = browserLang.split('-')[0];
      const names = lookupLanguageName(browserLang) ?? lookupLanguageName(base);
      if (names) {
        const locale = lookupLanguageName(browserLang) ? browserLang : base;
        dispatch({ type: 'INIT_LANGUAGE', locale });
        onLanguageSelect?.(locale);
        if (persist && typeof localStorage !== 'undefined') {
          try { localStorage.setItem(storageKey, locale); } catch { /* ignore */ }
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCountryHover = useCallback((iso: string | null, name: string | null) => {
    dispatch({ type: 'HOVER_COUNTRY', iso, name });
  }, []);

  const handleCountryClick = useCallback((iso: string, name: string) => {
    dispatch({ type: 'SELECT_COUNTRY', iso, name });
  }, []);

  const handleLanguageSelect = useCallback(
    (locale: string) => {
      dispatch({ type: 'SELECT_LANGUAGE', locale });
      if (persist && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(storageKey, locale);
        } catch { /* ignore */ }
      }
      onLanguageSelect?.(locale);
    },
    [onLanguageSelect, persist, storageKey],
  );

  const dismissSuggestion = useCallback(() => {
    dispatch({ type: 'DISMISS_SUGGESTION' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setView = useCallback((view: 'globe' | 'flatmap' | 'result') => {
    dispatch({ type: 'SET_VIEW', view });
  }, []);

  const countryData = useMemo(
    () => (state.selectedCountry ? mergedLanguages[state.selectedCountry] ?? null : null),
    [state.selectedCountry, mergedLanguages],
  );

  const welcomePhrase = useMemo(() => {
    if (!state.selectedLanguage) return null;
    // Check custom phrases first
    if (welcomePhrases?.[state.selectedLanguage]) {
      return welcomePhrases[state.selectedLanguage]!.replace('{appName}', appName);
    }
    return getWelcomePhrase(state.selectedLanguage, appName);
  }, [state.selectedLanguage, appName, welcomePhrases]);

  return {
    state,
    resolvedTheme,
    countryData,
    mergedLanguages,
    welcomePhrase,
    handleCountryHover,
    handleCountryClick,
    handleLanguageSelect,
    dismissSuggestion,
    setView,
    reset,
  };
}
