# GeoLingua

A reading-free geographic language selector for React. Users pick their language by clicking their country on a 3D globe, using voice detection, or searching by name. No reading required.

## Install

```bash
npm install geolingua react react-dom three
```

## Quick Start

```tsx
import { GeoLingua } from 'geolingua';

function App() {
  return (
    <GeoLingua
      onLanguageSelect={(locale) => {
        // locale is a BCP 47 tag: "en", "es", "zh-CN", "ar-LB", "ht", etc.
        console.log('Selected:', locale);
        i18n.changeLanguage(locale);
      }}
    />
  );
}
```

## Icon Mode (Compact)

Embed as a small icon that expands on click — ideal for integration into existing apps:

```tsx
<GeoLingua
  initialMode="icon"
  onLanguageSelect={(locale) => i18n.changeLanguage(locale)}
  style={{ position: 'fixed', bottom: 24, right: 24 }}
/>
```

Or use a custom trigger:

```tsx
<GeoLingua
  initialMode="icon"
  onLanguageSelect={(locale) => i18n.changeLanguage(locale)}
  renderTrigger={({ onClick, selectedLocale }) => (
    <button onClick={onClick}>
      {selectedLocale ?? 'Language'}
    </button>
  )}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onLanguageSelect` | `(locale: string) => void` | *required* | Called with the selected BCP 47 locale code |
| `appName` | `string` | `'this app'` | App name shown in welcome phrases |
| `theme` | `ThemePreset \| ThemeObject` | `'fresco'` | Visual theme: `'fresco'`, `'space'`, `'minimal'`, `'a11y'`, or custom |
| `initialMode` | `'full' \| 'icon'` | `'full'` | `'icon'` renders a compact trigger that expands to show the globe |
| `autoCollapseOnSelect` | `boolean` | `true` | Auto-collapse to icon after selection (icon mode only) |
| `renderTrigger` | `(props) => ReactNode` | — | Custom trigger element for icon mode |
| `detectBrowserLanguage` | `boolean` | `true` | Auto-detect browser language and show suggestion |
| `persist` | `boolean` | `true` | Persist selected locale to localStorage |
| `storageKey` | `string` | `'geolingua_locale'` | localStorage key for persistence |
| `showSkip` | `boolean` | `true` | Show "Continue in English" skip button |
| `skipLabel` | `string` | `'Continue in English'` | Skip button label |
| `onSkip` | `() => void` | — | Custom skip handler (default: calls `onLanguageSelect('en')`) |
| `customLanguageData` | `Partial<CountryLanguageMap>` | — | Extend or override built-in language data |
| `welcomePhrases` | `Partial<Record<string, string>>` | — | Custom welcome phrases by locale |
| `maxLanguagesShown` | `number` | `8` | Languages shown before "show more" |
| `rotationSpeed` | `number` | `0.002` | Globe auto-rotation speed |
| `voiceDetectionEnabled` | `boolean` | `true` | Show microphone button for voice language detection |
| `voiceDetection` | `VoiceDetectionConfig` | — | Voice detection config (API keys, proxy endpoint for Whisper/Azure) |
| `onVoiceDetection` | `(result) => void` | — | Called with voice detection results |
| `onReady` | `() => void` | — | Called when globe finishes loading |
| `onError` | `(error) => void` | — | Called on errors (geo data load, mic access, detection failures) |
| `globeAriaLabel` | `string` | — | Custom ARIA label for the globe |
| `className` | `string` | — | CSS class for the root element |
| `style` | `CSSProperties` | — | Inline styles for the root element |

## Themes

```tsx
<GeoLingua theme="space" onLanguageSelect={handleSelect} />
```

Built-in presets: `fresco` (warm parchment), `space` (dark), `minimal` (clean white), `a11y` (high contrast).

## Voice Detection

Browser-based (Tier 1) works out of the box on Chrome/Edge. For better accuracy, add Whisper:

```tsx
<GeoLingua
  voiceDetection={{
    provider: 'whisper',
    openaiApiKey: 'sk-...',  // Use a proxy in production!
  }}
  onLanguageSelect={handleSelect}
/>
```

**Production setup:** Use a server-side proxy to avoid exposing API keys in client code:

```tsx
<GeoLingua
  voiceDetection={{
    provider: 'whisper',
    whisperEndpoint: '/api/detect-language', // Your proxy endpoint
  }}
  onLanguageSelect={handleSelect}
/>
```

Your proxy forwards the request to OpenAI and returns the response. No API key is needed client-side when using a custom endpoint.

## Headless Hook

Build a fully custom UI with the same state logic:

```tsx
import { useGeoLingua } from 'geolingua';

const { state, handleLanguageSelect, reset } = useGeoLingua({
  onLanguageSelect: (locale) => i18n.changeLanguage(locale),
  customLanguageData: { 'XX': { name: 'Custom', hasSubdivisions: false, languages: [...] } },
});
```

## Language Notes

- **Haitian Creole** uses locale code `ht` (distinct from French `fr`). Recommended fallback: `ht` -> `fr` -> `en`.
- **Lebanese Arabic** uses `ar-LB`. Falls back to Modern Standard Arabic `ar`.
- **Chinese**: `zh-CN` (Simplified) and `zh-TW` (Traditional) are separate locale codes with different character sets.
- RTL languages (Arabic, Hebrew, Urdu, etc.) automatically set `dir="rtl"`.

## Browser Support

- Chrome/Edge: Full support including voice detection
- Firefox: Globe + search work; voice detection requires Whisper API keys
- Safari: Globe + search work; voice detection limited

## Requirements

- React >= 17
- Three.js >= 0.150 (peer dependency)
- WebGL-capable browser (for 3D globe)
- Network access to jsdelivr CDN (for country boundary data)

## License

MIT
