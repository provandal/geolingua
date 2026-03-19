<p align="center">
  <img src="assets/geolingua-icon.png" alt="GeoLingua" width="280" />
</p>

<h1 align="center">GeoLingua</h1>

<p align="center">
  Reading-free geographic language selection for React apps.<br/>
  Show users a globe. Let them tap their country. Hear their language spoken.<br/>
  No reading required — ever.
</p>

## Install

```bash
npm install geolingua
```

## Usage

```jsx
import { GeoLingua } from 'geolingua';

function App() {
  const handleLanguageSelect = (locale) => {
    i18n.changeLanguage(locale);
  };

  return <GeoLingua appName="MyApp" onLanguageSelect={handleLanguageSelect} />;
}
```

## Themes

```jsx
import { GeoLingua } from 'geolingua';

<GeoLingua theme="space" onLanguageSelect={handleLanguageSelect} />
// or: theme="fresco" (default) | "minimal" | "a11y"
// or: theme={customThemeObject}
```

## Why GeoLingua

Standard language selectors require users to read a dropdown list.
GeoLingua solves the bootstrap paradox: how do you select a language
before you can read the interface?

The answer: geography is universal. Everyone knows where they live.

## Voice Detection

GeoLingua includes a microphone button for voice-based language detection:

- **Tier 1 (free):** Uses browser SpeechRecognition with script-based heuristics
- **Tier 2 (API key):** OpenAI Whisper or Azure Cognitive Services for high accuracy

```jsx
<GeoLingua
  voiceDetection={{ provider: 'whisper', openaiApiKey: 'sk-...' }}
  onLanguageSelect={handleLanguageSelect}
/>
```

## Headless Hook

```jsx
import { useGeoLingua } from 'geolingua';

const { state, handleCountryClick, handleLanguageSelect } = useGeoLingua({
  appName: 'MyApp',
  onLanguageSelect: (locale) => console.log(locale),
});
```

---

Open source · MIT · [github.com/provandal/geolingua](https://github.com/provandal/geolingua)

Created by Erik Smith
