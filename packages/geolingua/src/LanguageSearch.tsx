import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type { ThemeObject, CountryLanguageMap } from './types';
import { isRTL } from './types';

interface LanguageSearchProps {
  theme: ThemeObject;
  languageData: CountryLanguageMap;
  onSelect: (locale: string) => void;
}

interface SearchEntry {
  code: string;
  nativeName: string;
  englishName: string;
}

export function LanguageSearch({ theme, languageData, onSelect }: LanguageSearchProps) {
  const [query, setQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build deduplicated flat list of all languages
  const allLanguages = useMemo<SearchEntry[]>(() => {
    const seen = new Map<string, SearchEntry>();
    for (const country of Object.values(languageData)) {
      for (const lang of country.languages) {
        if (!seen.has(lang.code)) {
          seen.set(lang.code, {
            code: lang.code,
            nativeName: lang.nativeName,
            englishName: lang.englishName,
          });
        }
      }
    }
    return Array.from(seen.values()).sort((a, b) =>
      a.englishName.localeCompare(b.englishName),
    );
  }, [languageData]);

  // Filter by query
  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allLanguages
      .filter(
        (l) =>
          l.englishName.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, allLanguages]);

  const handleSelect = useCallback(
    (code: string) => {
      setQuery('');
      setIsOpen(false);
      setFocusedIndex(-1);
      onSelect(code);
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && focusedIndex >= 0 && filtered[focusedIndex]) {
        e.preventDefault();
        handleSelect(filtered[focusedIndex].code);
      } else if (e.key === 'Escape') {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [filtered, focusedIndex, handleSelect],
  );

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  // Reset focus index when results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filtered.length]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        {/* Search icon */}
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke={theme.textSecondary} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => { if (query) setIsOpen(true); }}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setIsOpen(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search languages..."
          aria-label="Search for a language by name"
          aria-expanded={isOpen && filtered.length > 0}
          role="combobox"
          aria-autocomplete="list"
          style={{
            width: '100%',
            padding: '8px 12px 8px 32px',
            borderRadius: 20,
            border: `1px solid ${theme.panelBorder}`,
            background: theme.panelBackground,
            color: theme.textPrimary,
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Results dropdown */}
      {isOpen && filtered.length > 0 && (
        <div
          ref={listRef}
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: theme.panelBackground,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 12,
            overflow: 'auto',
            maxHeight: 280,
            zIndex: 30,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          {filtered.map((lang, i) => {
            const rtl = isRTL(lang.code);
            return (
              <div
                key={lang.code}
                role="option"
                aria-selected={i === focusedIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(lang.code)}
                onMouseEnter={() => setFocusedIndex(i)}
                dir={rtl ? 'rtl' : 'ltr'}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: i === focusedIndex ? theme.accent + '18' : 'transparent',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${theme.panelBorder}` : 'none',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                }}
              >
                <span style={{ color: theme.textPrimary, fontSize: 15, fontWeight: 500 }}>
                  {lang.nativeName}
                </span>
                <span style={{ color: theme.textSecondary, fontSize: 13 }}>
                  ({lang.englishName})
                </span>
                <span style={{
                  marginLeft: 'auto',
                  color: theme.textSecondary,
                  fontSize: 11,
                  fontFamily: 'ui-monospace, monospace',
                  opacity: 0.6,
                }}>
                  {lang.code}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
