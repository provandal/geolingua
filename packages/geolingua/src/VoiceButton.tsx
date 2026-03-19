import { useState, useRef, useCallback, useEffect } from 'react';
import type { ThemeObject, MicState, DetectionResult, VoiceDetectionConfig } from './types';
import { GeoLinguaError } from './types';
import { getSupportedMimeType, runDetection, createLiveDetector } from './voice/detection';
import type { LiveDetector } from './voice/detection';
import { lookupLanguageName } from './utils/languageNames';

const PROCESSING_TIMEOUT_MS = 60_000;

interface VoiceButtonProps {
  theme: ThemeObject;
  voiceDetection?: VoiceDetectionConfig;
  onResult: (result: DetectionResult) => void;
  onError?: (error: GeoLinguaError) => void;
  onSelectLanguage: (locale: string) => void;
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpinnerIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" style={{ animation: 'gl-spin 1s linear infinite' }}>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function StopIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

export function VoiceButton({ theme, voiceDetection, onResult, onError, onSelectLanguage }: VoiceButtonProps) {
  const [micState, setMicState] = useState<MicState>('idle');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);
  const liveDetectorRef = useRef<LiveDetector | null>(null);
  const transcriptPollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioContextRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (transcriptPollerRef.current) clearInterval(transcriptPollerRef.current);
      playingAudioRef.current?.pause();
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      setLiveTranscript('');

      // Start live SpeechRecognition in parallel with recording
      const detector = createLiveDetector();
      liveDetectorRef.current = detector;
      detector.start();

      // Poll interim transcript for feedback
      transcriptPollerRef.current = setInterval(() => {
        const text = detector.getInterimTranscript();
        if (text) setLiveTranscript(text);
      }, 300);

      // Audio level monitoring via AnalyserNode
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioCtx;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(100);
      setMicState('recording');
    } catch {
      setMicState('error');
      onError?.(new GeoLinguaError('mic_access_denied'));
    }
  }, []);

  const stopAndAnalyze = useCallback(async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || micState !== 'recording') return;

    // Stop audio level monitoring
    cancelAnimationFrame(animFrameRef.current);
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setAudioLevel(0);

    // Stop transcript poller
    if (transcriptPollerRef.current) {
      clearInterval(transcriptPollerRef.current);
      transcriptPollerRef.current = null;
    }

    // Collect live detection result before stopping
    const liveResult = liveDetectorRef.current?.stop() ?? null;
    liveDetectorRef.current = null;

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed < 500) {
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
      setMicState('idle');
      setLiveTranscript('');
      return;
    }

    // Assign onstop BEFORE calling stop to avoid race condition
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });
    recorder.stream.getTracks().forEach((t) => t.stop());

    const audioBlob = new Blob(audioChunksRef.current, {
      type: recorder.mimeType,
    });

    if (audioBlob.size < 4000) {
      setMicState('idle');
      setLiveTranscript('');
      return;
    }

    // Store blob URL for playback
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);

    // Check if we already have a usable live result (no cloud keys needed)
    const hasCloudKeys = !!(voiceDetection?.openaiApiKey || voiceDetection?.azureApiKey);

    if (!hasCloudKeys && liveResult && liveResult.language) {
      // Enrich with names and show immediately — no processing spinner needed
      const names = lookupLanguageName(liveResult.language);
      if (names) {
        liveResult.nativeName = names.nativeName;
        liveResult.englishName = names.englishName;
      }
      setResult(liveResult);
      setMicState('result');
      setLiveTranscript('');
      onResult(liveResult);
      return;
    }

    // Need cloud processing — show spinner
    setMicState('processing');
    cancelledRef.current = false;
    setElapsedSec(0);

    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      cancelledRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      // If we have a live result, use it as fallback on timeout
      if (liveResult && liveResult.language) {
        const names = lookupLanguageName(liveResult.language);
        if (names) {
          liveResult.nativeName = names.nativeName;
          liveResult.englishName = names.englishName;
        }
        setResult(liveResult);
        setMicState('result');
        onResult(liveResult);
      } else {
        setMicState('idle');
      }
    }, PROCESSING_TIMEOUT_MS);

    try {
      const detection = await runDetection(audioBlob, voiceDetection, liveResult ?? undefined);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);

      if (cancelledRef.current) return;

      if (detection.language) {
        const names = lookupLanguageName(detection.language);
        if (names) {
          detection.nativeName = names.nativeName;
          detection.englishName = names.englishName;
        }
      }

      setResult(detection);
      setMicState('result');
      setLiveTranscript('');
      onResult(detection);
    } catch {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (!cancelledRef.current) {
        setMicState('error');
        onError?.(new GeoLinguaError('detection_failed'));
      }
    }
  }, [micState, voiceDetection, onResult, onError, audioUrl]);

  const cancelProcessing = useCallback(() => {
    cancelledRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setMicState('idle');
    setLiveTranscript('');
  }, []);

  const playRecording = useCallback(() => {
    if (!audioUrl) return;
    if (isPlaying && playingAudioRef.current) {
      playingAudioRef.current.pause();
      playingAudioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    const audio = new Audio(audioUrl);
    playingAudioRef.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
  }, [audioUrl, isPlaying]);

  const dismiss = useCallback(() => {
    setMicState('idle');
    setResult(null);
    setLiveTranscript('');
    playingAudioRef.current?.pause();
    setIsPlaying(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  const isSupported =
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function';

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    !!((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition);

  const hasCloudConfig = !!(voiceDetection?.openaiApiKey || voiceDetection?.azureApiKey || voiceDetection?.whisperEndpoint);

  if (!isSupported) return null;

  const ringSize = 4 + audioLevel * 18;
  const ringOpacity = 0.15 + audioLevel * 0.3;

  const displayName = result?.nativeName ?? result?.language ?? '';
  const displayEnglish = result?.englishName ?? '';

  const playButtonStyle = {
    background: 'none',
    border: `1px solid ${theme.panelBorder}`,
    borderRadius: 6,
    padding: '4px 10px',
    color: theme.textSecondary,
    cursor: 'pointer',
    fontSize: 12,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: 4,
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <style>{`
        @keyframes gl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gl-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes gl-fade-in {
            from { opacity: 1; transform: none; }
            to { opacity: 1; transform: none; }
          }
        }
      `}</style>

      {/* Result panel */}
      {micState === 'result' && result && (
        <div
          aria-live="assertive"
          style={{
            position: 'absolute',
            bottom: 64,
            background: theme.panelBackground,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 12,
            padding: 16,
            minWidth: 260,
            textAlign: 'center',
            animation: 'gl-fade-in 0.2s ease',
          }}
        >
          <div style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>
            {result.confidence >= 0.75 ? 'We heard:' : 'Best guess:'}
          </div>

          {result.language ? (
            <>
              <div style={{ color: theme.textPrimary, fontSize: 22, fontWeight: 600, marginBottom: 2 }}>
                {displayName}
              </div>
              {displayEnglish && displayEnglish !== displayName && (
                <div style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 8 }}>
                  ({displayEnglish})
                </div>
              )}
              {result.transcript && (
                <div style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                  fontStyle: 'italic',
                  maxWidth: 240,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: '0 auto 8px',
                }}>
                  &ldquo;{result.transcript}&rdquo;
                </div>
              )}
              <div style={{
                background: theme.panelBorder,
                borderRadius: 4,
                height: 6,
                margin: '8px 0',
                overflow: 'hidden',
              }}>
                <div style={{
                  background: theme.accent,
                  height: '100%',
                  width: `${Math.round(result.confidence * 100)}%`,
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 12 }}>
                {Math.round(result.confidence * 100)}% confidence
                {result.provider && <span> &middot; {result.provider === 'browser' ? 'local' : result.provider}</span>}
              </div>

              {audioUrl && (
                <div style={{ marginBottom: 12 }}>
                  <button onClick={playRecording} style={playButtonStyle}>
                    {isPlaying ? <StopIcon /> : <PlayIcon />}
                    {isPlaying ? 'Stop' : 'Play recording'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (result.language) onSelectLanguage(result.language);
                    dismiss();
                  }}
                  style={{
                    background: theme.accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Use {displayName}
                </button>
                <button
                  onClick={dismiss}
                  style={{
                    background: 'none',
                    border: `1px solid ${theme.panelBorder}`,
                    borderRadius: 8,
                    padding: '8px 16px',
                    color: theme.textPrimary,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Try again
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ color: theme.textPrimary, fontSize: 14, marginBottom: 12 }}>
                Couldn&apos;t identify the language.
              </div>
              {audioUrl && (
                <div style={{ marginBottom: 12 }}>
                  <button onClick={playRecording} style={playButtonStyle}>
                    {isPlaying ? <StopIcon /> : <PlayIcon />}
                    {isPlaying ? 'Stop' : 'Play recording'}
                  </button>
                </div>
              )}
              <button
                onClick={dismiss}
                style={{
                  background: 'none',
                  border: `1px solid ${theme.panelBorder}`,
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: theme.textPrimary,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}

      {/* Processing indicator */}
      {micState === 'processing' && (
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            bottom: 64,
            background: theme.panelBackground,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 10,
            padding: '12px 20px',
            minWidth: 220,
            textAlign: 'center',
            animation: 'gl-fade-in 0.2s ease',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: theme.textSecondary,
            fontSize: 14,
            marginBottom: 10,
          }}>
            <SpinnerIcon size={18} />
            Identifying language...
            <span style={{ fontSize: 12, opacity: 0.6 }}>{elapsedSec}s</span>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {audioUrl && (
              <button onClick={playRecording} style={playButtonStyle}>
                {isPlaying ? <StopIcon /> : <PlayIcon />}
                {isPlaying ? 'Stop' : 'Play'}
              </button>
            )}
            <button
              onClick={cancelProcessing}
              style={{
                background: 'none',
                border: `1px solid ${theme.panelBorder}`,
                borderRadius: 6,
                padding: '4px 10px',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mic button */}
      <button
        aria-label={
          micState === 'recording'
            ? 'Release to stop recording'
            : micState === 'processing'
              ? 'Identifying language'
              : 'Hold to speak your language for automatic detection'
        }
        onMouseDown={micState === 'idle' || micState === 'error' ? startRecording : undefined}
        onMouseUp={stopAndAnalyze}
        onTouchStart={micState === 'idle' || micState === 'error' ? startRecording : undefined}
        onTouchEnd={stopAndAnalyze}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && (micState === 'idle' || micState === 'error')) startRecording();
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') stopAndAnalyze();
        }}
        disabled={micState === 'processing'}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: micState === 'recording' ? '#ef4444' : theme.panelBackground,
          border: `2px solid ${micState === 'recording' ? '#ef4444' : theme.panelBorder}`,
          color: micState === 'recording' ? '#fff' : theme.textSecondary,
          cursor: micState === 'processing' ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, border-color 0.2s, box-shadow 0.05s ease-out',
          boxShadow: micState === 'recording'
            ? `0 0 0 ${ringSize}px rgba(239, 68, 68, ${ringOpacity})`
            : 'none',
        }}
      >
        {micState === 'processing' ? (
          <SpinnerIcon />
        ) : (
          <MicIcon />
        )}
      </button>

      {/* Recording status + live transcript */}
      {micState === 'recording' && (
        <div style={{
          textAlign: 'center',
          marginTop: 6,
          animation: 'gl-fade-in 0.2s ease',
        }}>
          <div aria-live="polite" style={{
            color: '#ef4444',
            fontSize: 13,
            fontWeight: 500,
          }}>
            Speak now...
          </div>
          {liveTranscript && (
            <div style={{
              color: theme.textSecondary,
              fontSize: 11,
              fontStyle: 'italic',
              marginTop: 2,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {liveTranscript}
            </div>
          )}
          {!hasSpeechRecognition && !hasCloudConfig && (
            <div style={{
              color: theme.textSecondary,
              fontSize: 10,
              marginTop: 4,
              opacity: 0.7,
            }}>
              Limited detection in this browser. For best results, use Chrome or configure a Whisper API key.
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {micState === 'error' && (
        <div
          role="button"
          tabIndex={0}
          onClick={dismiss}
          onKeyDown={(e) => { if (e.key === 'Enter') dismiss(); }}
          style={{
            color: '#ef4444',
            fontSize: 12,
            marginTop: 4,
            cursor: 'pointer',
          }}
        >
          Mic error — tap to retry
        </div>
      )}
    </div>
  );
}
