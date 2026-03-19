import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoLinguaProps, DetectionResult, ThemeObject, GeoLinguaTriggerProps } from './types';
import { isRTL } from './types';
import { resolveTheme } from './themes';
import { useGeoLingua } from './useGeoLingua';
import { Globe } from './Globe';
import { LanguageList } from './LanguageList';
import { LanguageSearch } from './LanguageSearch';
import { VoiceButton } from './VoiceButton';
import { lookupLanguageName } from './utils/languageNames';

// Welcome phrases to cycle through when nothing is selected
const CYCLE_PHRASES = [
  { code: 'en', text: 'Welcome' },
  { code: 'es', text: 'Bienvenido' },
  { code: 'zh-CN', text: '欢迎' },
  { code: 'ar', text: 'مرحباً' },
  { code: 'fr', text: 'Bienvenue' },
  { code: 'hi', text: 'स्वागत है' },
  { code: 'pt', text: 'Bem-vindo' },
  { code: 'ru', text: 'Добро пожаловать' },
  { code: 'ja', text: 'ようこそ' },
  { code: 'ko', text: '환영합니다' },
  { code: 'de', text: 'Willkommen' },
  { code: 'it', text: 'Benvenuto' },
  { code: 'he', text: 'ברוכים הבאים' },
  { code: 'ht', text: 'Byenveni' },
  { code: 'sw', text: 'Karibu' },
  { code: 'tr', text: 'Hoş Geldiniz' },
  { code: 'vi', text: 'Chào mừng' },
  { code: 'th', text: 'ยินดีต้อนรับ' },
];

// ─── WelcomeBanner ──────────────────────────────────────────

function WelcomeBanner({ theme }: { theme: ThemeObject }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interval = setInterval(() => {
      if (!prefersReducedMotion) setFade(false);
      timeoutRef.current = setTimeout(() => {
        setIndex((i) => (i + 1) % CYCLE_PHRASES.length);
        setFade(true);
      }, prefersReducedMotion ? 0 : 300);
    }, 2500);
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const phrase = CYCLE_PHRASES[index];
  const rtl = isRTL(phrase.code);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        textAlign: 'center',
        padding: '12px 16px',
        color: theme.textPrimary,
        fontSize: 28,
        fontWeight: 300,
        opacity: fade ? 1 : 0,
        transition: 'opacity 0.3s ease',
        fontFamily: `-apple-system, 'Noto Sans', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', Georgia, serif`,
        minHeight: 48,
      }}
    >
      {phrase.text}
    </div>
  );
}

// ─── Default icon trigger for compact mode ──────────────────
// "Creation of Adam meets the Globe" — Michelangelo-inspired
// illustration of a hand reaching toward a globe.

export function CreationGlobeIcon({ size = 36, src }: { size?: number; src?: string; /** @deprecated ignored — kept for API compat */ color?: string }) {
  return (
    <img
      src={src}
      alt="GeoLingua"
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}

function GeoLinguaIcon({
  theme,
  onClick,
  selectedLocale,
  iconSrc,
}: {
  theme: ThemeObject;
  onClick: () => void;
  selectedLocale: string | null;
  iconSrc?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="Open language selector"
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: `2px solid ${theme.panelBorder}`,
        background: theme.panelBackground,
        color: theme.textPrimary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'box-shadow 0.2s, transform 0.15s',
        overflow: 'hidden',
      }}
    >
      <CreationGlobeIcon size={32} src={iconSrc} />
    </button>
  );
}

// ─── Browser language suggestion banner ─────────────────────

function BrowserLanguageBanner({
  locale,
  theme,
  onAccept,
  onDismiss,
}: {
  locale: string;
  theme: ThemeObject;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const names = lookupLanguageName(locale);
  if (!names) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '6px 16px',
        fontSize: 13,
        color: theme.textSecondary,
        flexWrap: 'wrap',
      }}
    >
      <span>Detected: {names.nativeName} ({names.englishName})</span>
      <button
        onClick={onAccept}
        style={{
          background: theme.accent,
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          padding: '4px 12px',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Use {names.nativeName}
      </button>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: theme.textSecondary,
          cursor: 'pointer',
          fontSize: 12,
          textDecoration: 'underline',
          padding: '4px 6px',
        }}
      >
        Choose another
      </button>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────

export function GeoLingua({
  onLanguageSelect,
  appName = 'this app',
  theme: themeProp,
  showSkip = true,
  skipLabel = 'Continue in English',
  onSkip,
  rotationSpeed,
  maxLanguagesShown = 8,
  persist = true,
  storageKey = 'geolingua_locale',
  onReady,
  onError,
  globeAriaLabel,
  className,
  style,
  voiceDetectionEnabled = true,
  voiceDetection,
  onVoiceDetection,
  customLanguageData,
  welcomePhrases,
  initialMode = 'full',
  autoCollapseOnSelect = true,
  renderTrigger,
  detectBrowserLanguage = true,
  iconSrc,
}: GeoLinguaProps) {
  const {
    state,
    resolvedTheme,
    countryData,
    mergedLanguages,
    welcomePhrase,
    handleCountryHover,
    handleCountryClick,
    handleLanguageSelect: hookLanguageSelect,
    dismissSuggestion,
    setView,
    reset,
  } = useGeoLingua({
    appName,
    theme: themeProp,
    onLanguageSelect,
    persist,
    storageKey,
    customLanguageData,
    welcomePhrases,
    detectBrowserLanguage,
  });

  // Icon mode expansion state
  const [expanded, setExpanded] = useState(initialMode === 'full');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Click-outside handler for popover
  useEffect(() => {
    if (initialMode !== 'icon' || !expanded) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [initialMode, expanded]);

  // Auto-collapse after language selection in icon mode
  const handleLanguageSelect = useCallback(
    (locale: string) => {
      hookLanguageSelect(locale);
      if (initialMode === 'icon' && autoCollapseOnSelect) {
        setTimeout(() => setExpanded(false), 600);
      }
    },
    [hookLanguageSelect, initialMode, autoCollapseOnSelect],
  );

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      onLanguageSelect('en');
    }
  }, [onSkip, onLanguageSelect]);

  const handleVoiceResult = useCallback(
    (result: DetectionResult) => {
      onVoiceDetection?.(result);
    },
    [onVoiceDetection],
  );

  const handleVoiceSelect = useCallback(
    (locale: string) => {
      handleLanguageSelect(locale);
    },
    [handleLanguageSelect],
  );

  const handleSuggestionAccept = useCallback(() => {
    if (state.suggestedLanguage) {
      handleLanguageSelect(state.suggestedLanguage);
    }
  }, [state.suggestedLanguage, handleLanguageSelect]);

  // Language name lookup (works for both globe-selected and voice-detected)
  const selectedLangEntry = countryData?.languages.find(
    (l) => l.code === state.selectedLanguage,
  );
  const langNames = selectedLangEntry
    ? { nativeName: selectedLangEntry.nativeName, englishName: selectedLangEntry.englishName }
    : state.selectedLanguage
      ? lookupLanguageName(state.selectedLanguage)
      : null;

  // ─── Icon mode: render trigger ───────────────────────────
  const triggerProps: GeoLinguaTriggerProps = {
    onClick: () => {
      if (!expanded && initialMode === 'icon') {
        // Always show the globe when expanding, not a stale result view
        setView('globe');
      }
      setExpanded(!expanded);
    },
    isExpanded: expanded,
    selectedLocale: state.selectedLanguage,
  };

  if (initialMode === 'icon' && !expanded) {
    return (
      <div className={className} style={style}>
        {renderTrigger
          ? renderTrigger(triggerProps)
          : <GeoLinguaIcon theme={resolvedTheme} onClick={triggerProps.onClick} selectedLocale={state.selectedLanguage} iconSrc={iconSrc} />
        }
      </div>
    );
  }

  // ─── Result view ──────────────────────────────────────────
  if (state.view === 'result' && state.selectedLanguage) {
    const rtl = isRTL(state.selectedLanguage);
    const nativeName = langNames?.nativeName ?? state.selectedLanguage;
    const englishName = langNames?.englishName ?? '';

    const resultContent = (
      <div
        data-geolingua=""
        dir={rtl ? 'rtl' : 'ltr'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 32,
          background: resolvedTheme.background,
          minHeight: initialMode === 'icon' ? 300 : 400,
          borderRadius: 16,
          fontFamily: `-apple-system, 'Noto Sans', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`,
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 600, color: resolvedTheme.textPrimary }}>
          {nativeName}
        </div>
        {englishName && englishName !== nativeName && (
          <div style={{ fontSize: 16, color: resolvedTheme.textSecondary }}>
            ({englishName})
          </div>
        )}
        <div style={{ fontSize: 20, color: resolvedTheme.accent, marginTop: 8 }}>
          {welcomePhrase}
        </div>
        <div style={{
          fontSize: 12,
          color: resolvedTheme.textSecondary,
          fontFamily: 'ui-monospace, monospace',
          opacity: 0.6,
          marginTop: 4,
        }}>
          Locale: {state.selectedLanguage}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              background: 'none',
              border: `1px solid ${resolvedTheme.panelBorder}`,
              borderRadius: 8,
              padding: '10px 20px',
              color: resolvedTheme.textPrimary,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try another language
          </button>
        </div>
      </div>
    );

    if (initialMode === 'icon') {
      return (
        <div className={className} style={{ ...style, position: 'relative' }} ref={popoverRef}>
          {renderTrigger
            ? renderTrigger(triggerProps)
            : <GeoLinguaIcon theme={resolvedTheme} onClick={triggerProps.onClick} selectedLocale={state.selectedLanguage} iconSrc={iconSrc} />
          }
          <div style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: 8,
            width: 420,
            maxWidth: '90vw',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}>
            {resultContent}
          </div>
        </div>
      );
    }

    return (
      <div className={className} style={style}>
        {resultContent}
      </div>
    );
  }

  // ─── Full globe view ──────────────────────────────────────
  const globeContent = (
    <div
      data-geolingua=""
      role="application"
      aria-label="GeoLingua language selector"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: resolvedTheme.background,
        borderRadius: 16,
        overflow: 'hidden',
        fontFamily: `-apple-system, 'Noto Sans', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`,
        position: 'relative',
        height: initialMode === 'icon' ? undefined : '100%',
        minHeight: initialMode === 'icon' ? 360 : 400,
      }}
    >
      {/* Welcome banner */}
      <WelcomeBanner theme={resolvedTheme} />

      {/* Browser language suggestion */}
      {state.suggestedLanguage && (
        <BrowserLanguageBanner
          locale={state.suggestedLanguage}
          theme={resolvedTheme}
          onAccept={handleSuggestionAccept}
          onDismiss={dismissSuggestion}
        />
      )}

      {/* Language search */}
      <div style={{ padding: '0 16px 8px' }}>
        <LanguageSearch
          theme={resolvedTheme}
          languageData={mergedLanguages}
          onSelect={handleLanguageSelect}
        />
      </div>

      {/* Status bar showing hovered country */}
      {state.hoveredCountryName && !state.selectedCountry && (
        <div
          style={{
            textAlign: 'center',
            padding: '4px 0',
            color: resolvedTheme.textSecondary,
            fontSize: 14,
          }}
        >
          {state.hoveredCountryName}
        </div>
      )}

      <style>{`
        @keyframes gl-slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes gl-slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gl-globe-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes gl-slideIn {
            from { opacity: 1; transform: none; }
            to { opacity: 1; transform: none; }
          }
          @keyframes gl-slideUp {
            from { opacity: 1; transform: none; }
            to { opacity: 1; transform: none; }
          }
          @keyframes gl-globe-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        }
        /* Focus indicators for keyboard navigation */
        [data-geolingua] button:focus-visible,
        [data-geolingua] [role="button"]:focus-visible,
        [data-geolingua] input:focus-visible,
        [data-geolingua] [role="application"]:focus-visible {
          outline: 2px solid ${resolvedTheme.accent};
          outline-offset: 2px;
        }
        /* Mobile: language panel goes full-width */
        @media (max-width: 600px) {
          .gl-lang-panel {
            width: 100% !important;
            max-width: 100% !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            bottom: 0 !important;
            max-height: 60% !important;
            border-radius: 12px 12px 0 0 !important;
          }
        }
      `}</style>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 240,
        }}
      >
        {/* Globe */}
        <Globe
          theme={resolvedTheme}
          selectedCountry={state.selectedCountry}
          onCountryHover={handleCountryHover}
          onCountryClick={handleCountryClick}
          onReady={onReady}
          onError={onError}
          rotationSpeed={rotationSpeed}
          ariaLabel={globeAriaLabel}
        />

        {/* Voice detection button */}
        {voiceDetectionEnabled && (
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <VoiceButton
              theme={resolvedTheme}
              voiceDetection={voiceDetection}
              onResult={handleVoiceResult}
              onError={onError}
              onSelectLanguage={handleVoiceSelect}
            />
          </div>
        )}

        {/* Language list panel — overlay on the right */}
        {state.selectedCountry && (
          <div
            className="gl-lang-panel"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              bottom: 8,
              width: 340,
              maxWidth: 'calc(100% - 16px)',
              zIndex: 20,
              animation: 'gl-slideIn 0.25s ease',
              overflow: 'auto',
            }}
          >
            {countryData ? (
              <LanguageList
                country={countryData}
                appName={appName}
                theme={resolvedTheme}
                maxShown={maxLanguagesShown}
                onSelect={handleLanguageSelect}
              />
            ) : (
              <div
                style={{
                  background: resolvedTheme.panelBackground,
                  border: `1px solid ${resolvedTheme.panelBorder}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <h2 style={{ color: resolvedTheme.textPrimary, fontSize: 18, fontWeight: 600, margin: '0 0 8px 0' }}>
                  {state.selectedCountryName ?? state.selectedCountry}
                </h2>
                <p style={{ color: resolvedTheme.textSecondary, fontSize: 14, margin: 0 }}>
                  Language data not yet available for this country.
                </p>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={reset}
              aria-label="Close language panel"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: `1px solid ${resolvedTheme.panelBorder}`,
                background: resolvedTheme.panelBackground,
                color: resolvedTheme.textSecondary,
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 21,
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          style={{
            display: 'block',
            margin: '8px auto 12px',
            padding: '8px 24px',
            background: 'none',
            border: `1px solid ${resolvedTheme.skipButton}`,
            borderRadius: 20,
            color: resolvedTheme.skipButton,
            cursor: 'pointer',
            fontSize: 13,
            transition: 'opacity 0.15s',
          }}
        >
          {skipLabel}
        </button>
      )}
    </div>
  );

  // ─── Icon mode: render popover ──────────────────────────
  if (initialMode === 'icon') {
    return (
      <div className={className} style={{ ...style, position: 'relative' }} ref={popoverRef}>
        {renderTrigger
          ? renderTrigger(triggerProps)
          : <GeoLinguaIcon theme={resolvedTheme} onClick={triggerProps.onClick} selectedLocale={state.selectedLanguage} iconSrc={iconSrc} />
        }
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: 0,
          marginBottom: 8,
          width: 480,
          maxWidth: '90vw',
          height: 520,
          maxHeight: '80vh',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}>
          {globeContent}
        </div>
      </div>
    );
  }

  // ─── Full mode ────────────────────────────────────────────
  return (
    <div className={className} style={style}>
      {globeContent}
    </div>
  );
}
