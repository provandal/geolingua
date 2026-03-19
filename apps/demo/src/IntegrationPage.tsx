import { CreationGlobeIcon, isRTL, lookupLanguageName } from 'geolingua';
import type { ThemeObject } from 'geolingua';
import { t } from './translations';

function getLanguageNotes(locale: string): { heading: string; bullets: string[] } | null {
  const base = locale.split('-')[0];

  if (locale === 'ht' || base === 'ht') {
    return {
      heading: 'Haitian Creole',
      bullets: [
        'Use locale code "ht" (ISO 639-1) — Haitian Creole is a distinct language from French ("fr").',
        'Most i18n libraries (react-intl, i18next, next-intl) support "ht" natively.',
        'Recommended fallback chain: ht → fr → en. Many Haitian Creole speakers also read French.',
        'For voice detection, Whisper (Tier 2) provides the best Haitian Creole recognition. Browser speech recognition may misidentify Creole as French.',
        'Haiti is the world\'s largest Creole-speaking nation. Prioritize ht over fr when both are available.',
      ],
    };
  }

  if (locale === 'ar-LB') {
    return {
      heading: 'Lebanese Arabic',
      bullets: [
        'Use locale code "ar-LB" for Lebanese-specific formatting, dates, and number styles.',
        'For translations, fall back to Modern Standard Arabic ("ar") when Lebanese-specific content isn\'t available.',
        'Lebanese Arabic is RTL — GeoLingua automatically sets dir="rtl" for your UI.',
        'Browser speech recognition uses "ar" (generic Arabic) which covers Lebanese dialect. Voice detection identifies "ar" — pair with country selection (Lebanon) to map to "ar-LB".',
        'Consider supporting both Latin and Arabic script input, as many Lebanese speakers write in Arabizi (Latin transliteration).',
      ],
    };
  }

  if (base === 'ar') {
    return {
      heading: 'Arabic',
      bullets: [
        `Your app will receive locale code "${locale}". Arabic is RTL — GeoLingua automatically sets dir="rtl".`,
        'For region-specific formatting, use the full locale code (e.g., "ar-EG", "ar-SA"). Fall back to "ar" for shared translations.',
        'Consider supporting both Arabic and Latin script input for search and text fields.',
      ],
    };
  }

  if (locale === 'he') {
    return {
      heading: 'Hebrew',
      bullets: [
        'Hebrew is RTL — GeoLingua automatically sets dir="rtl" for your UI.',
        'Use Intl.DateTimeFormat("he") for Hebrew calendar formatting.',
        'Consider supporting both Hebrew and Latin script input.',
      ],
    };
  }

  if (base === 'zh') {
    return {
      heading: locale === 'zh-TW' || locale === 'yue'
        ? 'Traditional Chinese'
        : 'Simplified Chinese',
      bullets: [
        `Use "${locale}" to ensure correct character set: ${locale === 'zh-TW' || locale === 'yue' ? 'Traditional (繁體)' : 'Simplified (简体)'}.`,
        '"zh-CN" and "zh-TW" use different character sets and should have separate translation files.',
        'CJK text doesn\'t use spaces between words — ensure your UI handles line-breaking correctly (word-break: break-all or CSS line-break: anywhere).',
      ],
    };
  }

  return null;
}

export function IntegrationPage({
  locale,
  theme,
  onBack,
  iconSrc,
}: {
  locale: string;
  theme: ThemeObject;
  onBack: () => void;
  iconSrc: string;
}) {
  const rtl = isRTL(locale);
  const names = lookupLanguageName(locale);
  const englishName = names?.englishName ?? locale;
  const notes = getLanguageNotes(locale);

  const codeBlockStyle = {
    background: theme.background,
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 8,
    padding: '12px 14px',
    fontSize: 12,
    fontFamily: 'ui-monospace, "SF Mono", "Cascadia Code", "Consolas", monospace',
    color: theme.textPrimary,
    whiteSpace: 'pre' as const,
    overflowX: 'auto' as const,
    textAlign: 'left' as const,
    lineHeight: 1.5,
  };

  const sectionHeading = {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: 600 as const,
    marginBottom: 8,
  };

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: '8px 0 32px',
      }}
    >
      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: theme.accent,
          cursor: 'pointer',
          fontSize: 14,
          padding: 0,
          textAlign: rtl ? 'right' : 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {rtl ? '→' : '←'} {t(locale, 'backToGlobe')}
      </button>

      {/* Page title */}
      <h2 style={{ color: theme.textPrimary, fontSize: 22, fontWeight: 600, margin: 0 }}>
        {t(locale, 'integrationGuide')}
      </h2>

      {/* Hero icon section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '24px 16px',
        background: theme.panelBackground,
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: 12,
      }}>
        <CreationGlobeIcon size={120} src={iconSrc} />
        <div style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 600, marginTop: 8 }}>
          {t(locale, 'iconExplanationHeading')}
        </div>
        <div style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', maxWidth: 400, lineHeight: 1.5 }}>
          {t(locale, 'iconExplanation')}
        </div>
      </div>

      {/* Locale code */}
      <div>
        <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>
          {t(locale, 'localeCode')}
        </div>
        <code style={{
          background: theme.panelBackground,
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 18,
          fontWeight: 600,
          color: theme.accent,
          fontFamily: 'ui-monospace, "SF Mono", "Cascadia Code", "Consolas", monospace',
        }}>
          {locale}
        </code>
      </div>

      {/* Icon mode embed */}
      <div>
        <div style={sectionHeading}>{t(locale, 'iconModeHeading')}</div>
        <div style={codeBlockStyle}>
{`<GeoLingua
  initialMode="icon"
  iconSrc="/geolingua-icon.png"
  onLanguageSelect={(locale) => {
    i18n.changeLanguage(locale);
  }}
/>`}
        </div>
      </div>

      {/* React integration */}
      <div>
        <div style={sectionHeading}>{t(locale, 'reactIntegration')}</div>
        <div style={codeBlockStyle}>
{`<GeoLingua
  onLanguageSelect={(locale) => {
    // locale === "${locale}" (${englishName})
    i18n.changeLanguage(locale);
  }}
/>`}
        </div>
      </div>

      {/* Using the detected locale */}
      <div>
        <div style={sectionHeading}>{t(locale, 'usingDetectedLocale')}</div>
        <div style={codeBlockStyle}>
{`// Set document language
document.documentElement.lang = "${locale}";${isRTL(locale) ? `\ndocument.documentElement.dir = "rtl";` : ''}

// ${t(locale, 'formatDatesNumbers')}
new Intl.DateTimeFormat("${locale}")
  .format(new Date());

new Intl.NumberFormat("${locale}")
  .format(1234.56);

// ${t(locale, 'loadTranslations')}
const messages = await import(
  \`./locales/\${locale}.json\`
);`}
        </div>
      </div>

      {/* Language-specific notes */}
      {notes && (
        <div style={{
          background: theme.panelBackground,
          border: `1px solid ${theme.panelBorder}`,
          borderRadius: 8,
          padding: '12px 14px',
        }}>
          <div style={{ color: theme.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            {t(locale, 'languageNotes')}: {notes.heading}
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: rtl ? 0 : 18,
            paddingRight: rtl ? 18 : 0,
            color: theme.textSecondary,
            fontSize: 12,
            lineHeight: 1.6,
            listStyleType: 'disc',
          }}>
            {notes.bullets.map((b, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{b}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
