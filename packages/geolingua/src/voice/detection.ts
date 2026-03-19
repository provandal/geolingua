import type { DetectionResult, VoiceDetectionConfig } from '../types';
import { GeoLinguaError } from '../types';

// ─── Script detection ────────────────────────────────────────

const SCRIPT_RANGES: Record<string, RegExp> = {
  'zh-CN': /[\u4e00-\u9fff]/,
  'zh-TW': /[\u4e00-\u9fff]/,
  'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
  'ko': /[\uac00-\ud7af]/,
  'hi': /[\u0900-\u097f]/,
  'bn': /[\u0980-\u09ff]/,
  'th': /[\u0e00-\u0e7f]/,
  'ru': /[\u0400-\u04ff]/,
  'he': /[\u0590-\u05ff]/,
  'ka': /[\u10a0-\u10ff]/,
  'hy': /[\u0530-\u058f]/,
  'ta': /[\u0b80-\u0bff]/,
  'te': /[\u0c00-\u0c7f]/,
  'kn': /[\u0c80-\u0cff]/,
  'ml': /[\u0d00-\u0d7f]/,
  'gu': /[\u0a80-\u0aff]/,
  'pa': /[\u0a00-\u0a7f]/,
  'my': /[\u1000-\u109f]/,
  'km': /[\u1780-\u17ff]/,
  'lo': /[\u0e80-\u0eff]/,
  'am': /[\u1200-\u137f]/,
  // Arabic script handled separately — see detectArabicScriptLanguage()
};

// Urdu-specific characters: ٹ ڈ ڑ ں ھ ہ ے
const URDU_CHARS = /[\u0679\u0688\u0691\u06BA\u06BE\u06C1\u06D2]/;
// Farsi/Persian-specific characters: پ چ ژ گ
const FARSI_CHARS = /[\u067E\u0686\u0698\u06AF]/;
// General Arabic script range
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

function detectArabicScriptLanguage(text: string): string {
  const urduMatches = (text.match(new RegExp(URDU_CHARS.source, 'g')) ?? []).length;
  const farsiMatches = (text.match(new RegExp(FARSI_CHARS.source, 'g')) ?? []).length;

  if (urduMatches > farsiMatches && urduMatches >= 2) return 'ur';
  if (farsiMatches > urduMatches && farsiMatches >= 2) return 'fa';
  return 'ar';
}

// Common words per Latin-script language for word-frequency analysis
const LATIN_WORD_HINTS: [string, string[]][] = [
  ['ht', ['mwen', 'ou', 'li', 'nou', 'yo', 'se', 'pa', 'nan', 'ak', 'pou', 'men', 'ki', 'sa', 'te', 'gen', 'fè', 'di', 'lè', 'tout', 'yon', 'lòt', 'tankou', 'anpil', 'konnen', 'kote', 'bagay']],
  ['fr', ['le', 'la', 'les', 'des', 'est', 'je', 'nous', 'vous', 'avec', 'pour', 'dans', 'que', 'qui', 'une', 'pas', 'mais', 'sur', 'sont', 'plus', 'ce', 'cette', 'être']],
  ['es', ['el', 'los', 'las', 'es', 'yo', 'nosotros', 'con', 'para', 'que', 'por', 'una', 'pero', 'más', 'como', 'todo', 'esta', 'ser', 'tengo', 'somos']],
  ['de', ['der', 'die', 'das', 'ist', 'und', 'ich', 'wir', 'für', 'mit', 'nicht', 'ein', 'eine', 'auf', 'auch', 'sich', 'von', 'den', 'dem']],
  ['pt', ['os', 'as', 'eu', 'nós', 'com', 'para', 'que', 'por', 'uma', 'mas', 'mais', 'como', 'esta', 'ser', 'tem', 'dos', 'muito', 'são']],
  ['it', ['il', 'gli', 'io', 'noi', 'con', 'per', 'che', 'non', 'una', 'sono', 'più', 'come', 'del', 'della', 'anche', 'questo', 'quello']],
  ['nl', ['het', 'ik', 'wij', 'met', 'voor', 'niet', 'een', 'van', 'dat', 'ook', 'zijn', 'maar', 'naar', 'hij', 'deze']],
  ['tr', ['bir', 'bu', 've', 'için', 'ile', 'ben', 'biz', 'değil', 'var', 'olan', 'daha', 'çok', 'gibi', 'ama']],
  ['pl', ['jest', 'nie', 'się', 'to', 'na', 'do', 'ze', 'od', 'jak', 'ale', 'tak', 'czy', 'już', 'tylko', 'może']],
  ['sw', ['ni', 'ya', 'na', 'kwa', 'wa', 'katika', 'sana', 'hii', 'kama', 'pia', 'hiyo', 'yake', 'wote']],
  ['vi', ['là', 'của', 'và', 'có', 'trong', 'được', 'cho', 'với', 'này', 'các', 'không', 'một', 'những', 'đã']],
  ['id', ['yang', 'dan', 'ini', 'itu', 'dengan', 'untuk', 'dari', 'tidak', 'ada', 'saya', 'akan', 'sudah']],
  ['en', ['the', 'is', 'are', 'was', 'we', 'you', 'they', 'this', 'that', 'with', 'have', 'for', 'not', 'but', 'from', 'can', 'will']],
];

/**
 * Analyze a transcript to detect its language via script ranges and word frequency.
 */
export function analyzeTranscript(transcript: string): DetectionResult {
  const text = transcript.trim();
  if (!text) {
    return { language: null, confidence: 0, tier: 1, provider: 'browser' };
  }

  // 1a. Check Arabic script separately (differentiates ar/ur/fa)
  const arabicMatches = text.match(new RegExp(ARABIC_SCRIPT.source, 'g')) ?? [];
  const arabicRatio = arabicMatches.length / text.length;
  if (arabicRatio > 0.3) {
    return {
      language: detectArabicScriptLanguage(text),
      confidence: Math.min(0.9, 0.5 + arabicRatio),
      transcript: text,
      tier: 1,
      provider: 'browser',
    };
  }

  // 1b. Check other non-Latin scripts — high confidence
  for (const [lang, regex] of Object.entries(SCRIPT_RANGES)) {
    const matches = text.match(new RegExp(regex.source, 'g')) ?? [];
    const ratio = matches.length / text.length;
    if (ratio > 0.3) {
      return {
        language: lang,
        confidence: Math.min(0.9, 0.5 + ratio),
        transcript: text,
        tier: 1,
        provider: 'browser',
      };
    }
  }

  // 2. Latin script — word frequency analysis
  const words = text.toLowerCase().split(/\s+/);
  let bestLang = 'en';
  let bestScore = 0;

  for (const [lang, hints] of LATIN_WORD_HINTS) {
    const matchCount = words.filter((w) => hints.includes(w)).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestLang = lang;
    }
  }

  const confidence = Math.min(0.75, bestScore > 0 ? 0.3 + bestScore * 0.1 : 0.15);

  return {
    language: bestLang,
    confidence,
    transcript: text,
    tier: 1,
    provider: 'browser',
  };
}

// ─── Live detector (runs during recording) ───────────────────

export interface LiveDetector {
  start: () => void;
  stop: () => DetectionResult;
  getInterimTranscript: () => string;
}

/**
 * Creates a live SpeechRecognition detector that listens while the user
 * is recording. Call start() when recording begins and stop() when it ends.
 * The transcript is analyzed for language upon stop().
 */
export function createLiveDetector(): LiveDetector {
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
      : null;

  let recognition: any = null;
  let finalTranscript = '';
  let interimTranscript = '';

  return {
    start() {
      finalTranscript = '';
      interimTranscript = '';

      if (!SpeechRecognition) return;

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      // No lang set — browser default captures whatever is spoken

      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalText += res[0].transcript;
          } else {
            interimText += res[0].transcript;
          }
        }
        if (finalText) finalTranscript = finalText;
        interimTranscript = interimText;
      };

      recognition.onerror = () => {};
      recognition.onend = () => {};

      try {
        recognition.start();
      } catch { /* already started or not available */ }
    },

    stop(): DetectionResult {
      if (recognition) {
        try { recognition.stop(); } catch {}
        recognition = null;
      }

      const transcript = finalTranscript || interimTranscript;
      if (!transcript.trim()) {
        return { language: null, confidence: 0, tier: 1, provider: 'browser' };
      }

      return analyzeTranscript(transcript);
    },

    getInterimTranscript(): string {
      return interimTranscript || finalTranscript;
    },
  };
}

// ─── Tier 2: Whisper ────────────────────────────────────────

export const WHISPER_LANGUAGE_MAP: Record<string, string> = {
  'afrikaans': 'af', 'arabic': 'ar', 'armenian': 'hy',
  'azerbaijani': 'az', 'belarusian': 'be', 'bosnian': 'bs',
  'bulgarian': 'bg', 'catalan': 'ca', 'chinese': 'zh-CN',
  'croatian': 'hr', 'czech': 'cs', 'danish': 'da',
  'dutch': 'nl', 'english': 'en', 'estonian': 'et',
  'finnish': 'fi', 'french': 'fr', 'galician': 'gl',
  'german': 'de', 'greek': 'el', 'hebrew': 'he',
  'hindi': 'hi', 'hungarian': 'hu', 'icelandic': 'is',
  'indonesian': 'id', 'italian': 'it', 'japanese': 'ja',
  'kannada': 'kn', 'kazakh': 'kk', 'korean': 'ko',
  'latvian': 'lv', 'lithuanian': 'lt', 'macedonian': 'mk',
  'malay': 'ms', 'marathi': 'mr', 'maori': 'mi',
  'nepali': 'ne', 'norwegian': 'no', 'persian': 'fa',
  'polish': 'pl', 'portuguese': 'pt', 'punjabi': 'pa',
  'romanian': 'ro', 'russian': 'ru', 'serbian': 'sr',
  'slovak': 'sk', 'slovenian': 'sl', 'spanish': 'es',
  'swahili': 'sw', 'swedish': 'sv', 'tagalog': 'tl',
  'tamil': 'ta', 'telugu': 'te', 'thai': 'th',
  'turkish': 'tr', 'ukrainian': 'uk', 'urdu': 'ur',
  'uzbek': 'uz', 'vietnamese': 'vi', 'welsh': 'cy',
  'cantonese': 'yue',
  'haitian creole': 'ht', 'haitian': 'ht', 'creole': 'ht',
  'lebanese': 'ar-LB',
};

export async function detectLanguageWhisper(
  audioBlob: Blob,
  apiKey: string,
  endpoint?: string,
): Promise<DetectionResult> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');

  const url = endpoint ?? 'https://api.openai.com/v1/audio/transcriptions';
  const headers: Record<string, string> = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    },
  );

  if (!response.ok) {
    throw new GeoLinguaError('whisper_api_error', response.status);
  }

  const data = await response.json();
  const lang = data.language;
  const langCode = WHISPER_LANGUAGE_MAP[lang?.toLowerCase()] ?? lang ?? null;

  return {
    language: langCode,
    confidence: 0.95,
    transcript: data.text,
    tier: 2,
    provider: 'whisper',
  };
}

// ─── Tier 2: Azure ──────────────────────────────────────────

export async function detectLanguageAzure(
  audioBlob: Blob,
  apiKey: string,
  region: string,
): Promise<DetectionResult> {
  const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'audio/webm;codecs=opus',
      'Accept-Language': 'en-US',
    },
    body: audioBlob,
  });

  if (!response.ok) {
    throw new GeoLinguaError('azure_api_error', response.status);
  }

  const data = await response.json();
  const langCode = data.Language?.split('-')[0] ?? null;
  const confidence =
    data.Confidence === 'High' ? 0.9 : data.Confidence === 'Medium' ? 0.65 : 0.35;

  return {
    language: langCode,
    confidence,
    transcript: data.DisplayText,
    tier: 2,
    provider: 'azure',
  };
}

// ─── Audio recording helpers ────────────────────────────────

export function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  return types.find((t) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? '';
}

// ─── Orchestrator ───────────────────────────────────────────

/**
 * Run language detection on a recorded audio blob.
 * If a liveResult is provided (from SpeechRecognition during recording),
 * it's used as the Tier 1 fallback instead of starting new recognition.
 */
export async function runDetection(
  audioBlob: Blob,
  config?: VoiceDetectionConfig,
  liveResult?: DetectionResult,
): Promise<DetectionResult> {
  const provider = config?.provider ?? 'auto';

  // Tier 2 if keys available — cloud APIs analyze the actual audio blob
  if (provider !== 'auto' || config?.openaiApiKey || config?.azureApiKey) {
    if ((provider === 'whisper' || provider === 'auto') && (config?.openaiApiKey || config?.whisperEndpoint)) {
      try {
        return await detectLanguageWhisper(audioBlob, config.openaiApiKey ?? '', config.whisperEndpoint);
      } catch {
        if (provider === 'whisper') throw new GeoLinguaError('whisper_failed');
      }
    }
    if ((provider === 'azure' || provider === 'auto') && config?.azureApiKey && config?.azureRegion) {
      try {
        return await detectLanguageAzure(audioBlob, config.azureApiKey, config.azureRegion);
      } catch {
        if (provider === 'azure') throw new GeoLinguaError('azure_failed');
      }
    }
  }

  // Tier 1: use live detection result captured during recording
  if (liveResult && liveResult.language) {
    return liveResult;
  }

  return { language: null, confidence: 0, tier: 1, provider: 'browser' };
}
