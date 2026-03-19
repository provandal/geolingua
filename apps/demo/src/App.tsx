import { useState, useCallback } from 'react';
import { GeoLingua, resolveTheme, lookupLanguageName } from 'geolingua';
import type { ThemePreset } from 'geolingua';
import { useHashRoute } from './useHashRoute';
import { IntegrationPage } from './IntegrationPage';
import { t } from './translations';

// One-time migration: clear stale locale from old persistence behavior
const MIGRATION_KEY = 'geolingua_demo_v2';
if (typeof localStorage !== 'undefined' && !localStorage.getItem(MIGRATION_KEY)) {
  localStorage.removeItem('geolingua_locale');
  localStorage.setItem(MIGRATION_KEY, '1');
}

const THEMES: ThemePreset[] = ['fresco', 'space', 'minimal', 'a11y'];
const ICON_SRC = import.meta.env.BASE_URL + 'geolingua-icon.png';

function App() {
  const [theme, setTheme] = useState<ThemePreset>('fresco');
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null);
  const { page, navigate } = useHashRoute();

  const handleLanguageSelect = useCallback((locale: string) => {
    setSelectedLocale(locale);
    console.log('Language selected:', locale);
  }, []);

  const themeColors: Record<ThemePreset, { bg: string; text: string; border: string }> = {
    fresco: { bg: '#f8f4ee', text: '#2c3e50', border: '#c8a96e' },
    space: { bg: '#020817', text: '#f1f5f9', border: '#1e293b' },
    minimal: { bg: '#ffffff', text: '#0f172a', border: '#e2e8f0' },
    a11y: { bg: '#000000', text: '#ffffff', border: '#ffff00' },
  };

  const colors = themeColors[theme];
  const resolvedTheme = resolveTheme(theme);

  // Language name for the "How to integrate" link
  const langNames = selectedLocale ? lookupLanguageName(selectedLocale) : null;
  const displayLangName = langNames?.nativeName ?? langNames?.englishName ?? selectedLocale;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colors.bg,
        transition: 'background 0.3s ease',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 600,
            margin: 0,
            fontFamily: 'Georgia, serif',
            cursor: 'pointer',
          }}
          onClick={() => navigate('#/')}
        >
          <span style={{ color: '#2c3e50' }}>Geo</span>
          <span style={{ color: '#4a88c0' }}>Lingua</span>
        </h1>

        {/* Theme switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 16,
                border: `1px solid ${t === theme ? '#4a88c0' : colors.border}`,
                background: t === theme ? '#4a88c022' : 'transparent',
                color: colors.text,
                cursor: 'pointer',
                fontSize: 13,
                textTransform: 'capitalize',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/provandal/geolingua"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.text, textDecoration: 'none', fontSize: 14 }}
        >
          GitHub ↗
        </a>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, overflow: page === 'guide' ? 'auto' : 'hidden', padding: page === 'guide' ? 24 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {page === 'guide' ? (
          selectedLocale ? (
            <IntegrationPage
              locale={selectedLocale}
              theme={resolvedTheme}
              onBack={() => navigate('#/')}
              iconSrc={ICON_SRC}
            />
          ) : (
            /* No locale yet — redirect to landing */
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              color: colors.text,
            }}>
              <div style={{ opacity: 0.5, fontSize: 16 }}>
                Select a language first to see integration details.
              </div>
              <button
                onClick={() => navigate('#/')}
                style={{
                  background: 'none',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  padding: '8px 20px',
                  color: colors.text,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Go to Globe
              </button>
            </div>
          )
        ) : (
          /* Landing page — full globe */
          <div style={{
            flex: 1,
            width: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <GeoLingua
              theme={theme}
              appName="GeoLingua"
              initialMode="full"
              onLanguageSelect={handleLanguageSelect}
              style={{ flex: 1, minHeight: 0, overflow: 'visible' }}
            />

            {/* "How to integrate" link — shown after a language is selected */}
            {selectedLocale && (
              <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                <button
                  onClick={() => navigate('#/guide')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resolvedTheme.accent,
                    cursor: 'pointer',
                    fontSize: 15,
                    padding: '8px 4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {t(selectedLocale, 'howToIntegrate')} {displayLangName} →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
