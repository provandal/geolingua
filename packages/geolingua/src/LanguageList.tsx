import { useState, useCallback, useEffect, useRef } from 'react';
import type { CountryData, SubdivisionData, ThemeObject, LanguageEntry } from './types';
import { isRTL } from './types';
import { getWelcomePhrase } from './data/welcomePhrases';

interface LanguageListProps {
  country: CountryData | null;
  subdivision?: SubdivisionData | null;
  appName: string;
  theme: ThemeObject;
  maxShown: number;
  onSelect: (locale: string) => void;
  onSpeakWelcome?: (locale: string) => void;
}

function SpeakerIcon({ playing }: { playing: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={playing ? { animation: 'gl-pulse 0.8s ease-in-out infinite' } : undefined}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState<string | null>(null);

  useEffect(() => {
    function loadVoices() {
      setVoices(speechSynthesis.getVoices());
    }
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const findVoice = useCallback(
    (locale: string): SpeechSynthesisVoice | null => {
      // Exact match
      const exact = voices.find((v) => v.lang === locale);
      if (exact) return exact;

      // Prefix match (ar-LB -> ar-*)
      const prefix = locale.split('-')[0];
      // For Arabic specifically, prefer ar-EG as fallback
      if (prefix === 'ar') {
        const egyVoice = voices.find((v) => v.lang === 'ar-EG');
        if (egyVoice) return egyVoice;
      }
      const prefixMatch = voices.find((v) => v.lang.startsWith(prefix));
      if (prefixMatch) return prefixMatch;

      return null;
    },
    [voices],
  );

  const speak = useCallback(
    (text: string, locale: string) => {
      speechSynthesis.cancel();
      const voice = findVoice(locale);
      if (!voice) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.voice = voice;
      utterance.onstart = () => setSpeaking(locale);
      utterance.onend = () => setSpeaking(null);
      utterance.onerror = () => setSpeaking(null);
      speechSynthesis.speak(utterance);
    },
    [findVoice],
  );

  const hasVoice = useCallback(
    (locale: string) => findVoice(locale) !== null,
    [findVoice],
  );

  return { speak, speaking, hasVoice };
}

export function LanguageList({
  country,
  subdivision,
  appName,
  theme,
  maxShown,
  onSelect,
}: LanguageListProps) {
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { speak, speaking, hasVoice } = useTTS();

  // Reset expansion when country changes
  useEffect(() => {
    setExpanded(false);
  }, [country]);

  if (!country) return null;

  const data = subdivision ?? country;
  const langs = [...data.languages].sort((a, b) => b.speakers - a.speakers);
  const visible = expanded ? langs : langs.slice(0, maxShown);
  const remaining = langs.length - maxShown;

  const handleSpeak = (lang: LanguageEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    const phrase = getWelcomePhrase(lang.code, appName);
    speak(phrase, lang.code);
  };

  return (
    <div
      ref={listRef}
      style={{
        background: theme.panelBackground,
        border: `1px solid ${theme.panelBorder}`,
        borderRadius: 12,
        padding: 16,
        overflow: 'auto',
        maxHeight: '100%',
      }}
    >
      <style>{`
        @keyframes gl-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <h2
        style={{
          color: theme.textPrimary,
          fontSize: 18,
          fontWeight: 600,
          margin: '0 0 12px 0',
        }}
      >
        {data.name ?? country.name}
      </h2>

      <div role="list">
        {visible.map((lang) => {
          const rtl = isRTL(lang.code);
          const voiceAvailable = hasVoice(lang.code);
          const isPlaying = speaking === lang.code;

          return (
            <div
              key={lang.code}
              role="button"
              tabIndex={0}
              dir={rtl ? 'rtl' : 'ltr'}
              aria-label={`${lang.nativeName} — ${lang.englishName}`}
              onClick={() => onSelect(lang.code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(lang.code);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                marginBottom: 4,
                borderRadius: 8,
                cursor: 'pointer',
                minHeight: 48,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = `${theme.accent}22`)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = 'transparent')
              }
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: theme.textPrimary,
                    fontSize: 16,
                    fontWeight: 500,
                    fontFamily: `-apple-system, 'Noto Sans', 'Noto Sans CJK SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`,
                  }}
                >
                  {lang.nativeName}
                </div>
                <div
                  dir="ltr"
                  style={{
                    color: theme.textSecondary,
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  ({lang.englishName})
                </div>
              </div>

              <button
                aria-label={`${lang.nativeName} audio preview`}
                title={
                  voiceAvailable
                    ? `Listen to welcome phrase in ${lang.englishName}`
                    : 'Audio preview not available for this language in your browser'
                }
                onClick={(e) => handleSpeak(lang, e)}
                disabled={!voiceAvailable}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: voiceAvailable ? 'pointer' : 'default',
                  color: voiceAvailable ? theme.accent : theme.textSecondary,
                  opacity: voiceAvailable ? 1 : 0.3,
                  padding: 6,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  marginLeft: rtl ? 0 : 8,
                  marginRight: rtl ? 8 : 0,
                }}
              >
                <SpeakerIcon playing={isPlaying} />
              </button>
            </div>
          );
        })}
      </div>

      {remaining > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            marginTop: 8,
            background: 'none',
            border: `1px dashed ${theme.panelBorder}`,
            borderRadius: 8,
            color: theme.accent,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Show {remaining} more language{remaining > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
