import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AudioTranscriptionConfigMode, GoogleGenAI, Modality } from '@google/genai';
import type { LiveServerMessage, Session } from '@google/genai';

const TTS_MODEL = 'gemini-3.1-flash-live-preview';
const TTS_VOICE = 'Charon';
const TTS_SAMPLE_RATE = 24000;
const STT_MODEL = 'gemini-3.5-transcribe-live';
const BENGALI_SCRIPT = /[ঀ-৿]/;
const MAX_SEGMENT_CHARS = 1500;
const IDLE_TIMEOUT_MS = 15_000;
const SECONDS_PER_WORD = 0.3;
const MIN_COVERAGE = 0.6;
const MAX_CONTINUATIONS = 2;

export type SpeechLanguage = 'en-US' | 'bn-BD';

export type SpeechEvent =
  | { event: 'start'; sampleRate: number }
  | { event: 'chunk'; pcm: Buffer }
  | { event: 'end'; ok: true }
  | { event: 'end'; ok: false; error: string };

export interface TranscriptionHandlers {
  onInterim: (text: string) => void;
  onTranscript: (text: string) => void;
  onTurnEnd: () => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export type TranscriptionSession = Session;

function splitForSpeech(text: string): string[] {
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?।?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const segments: string[] = [];
  let current = '';
  const push = (segment: string) => {
    if (segment.trim()) segments.push(segment.trim());
  };

  for (const sentence of sentences) {
    if (sentence.length > MAX_SEGMENT_CHARS) {
      push(current);
      let rest = sentence;
      while (rest.length > MAX_SEGMENT_CHARS) {
        const window = rest.slice(0, MAX_SEGMENT_CHARS);
        const cut = Math.max(window.lastIndexOf(', '), window.lastIndexOf(' '));
        const at = cut > MAX_SEGMENT_CHARS / 2 ? cut + 1 : MAX_SEGMENT_CHARS;
        push(rest.slice(0, at));
        rest = rest.slice(at).trim();
      }
      current = rest;
      continue;
    }
    if (current && current.length + 1 + sentence.length > MAX_SEGMENT_CHARS) {
      push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  push(current);
  return segments;
}

function countWords(text: string) {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

function countLetters(text: string) {
  return text.replace(/[^\p{L}\p{N}]/gu, '').length;
}

function unspokenRemainder(requested: string, transcript: string, audioSeconds: number) {
  const words = requested.split(/\s+/).filter(Boolean);
  const totalWords = countWords(requested);
  const totalLetters = countLetters(requested);
  if (totalWords < 3 || totalLetters === 0) return '';

  const spokenLetters = Math.min(countLetters(transcript), totalLetters);
  const coverage = Math.max(spokenLetters / totalLetters, audioSeconds / (totalWords * SECONDS_PER_WORD));
  if (coverage >= MIN_COVERAGE) return '';

  let resumeAt = 0;
  if (spokenLetters > 0) {
    let letters = 0;
    while (resumeAt < words.length && letters + countLetters(words[resumeAt]) <= spokenLetters) {
      letters += countLetters(words[resumeAt]);
      resumeAt += 1;
    }
  } else {
    resumeAt = Math.floor(audioSeconds / (SECONDS_PER_WORD * 1.5));
  }
  const remainder = words.slice(resumeAt).join(' ').trim();
  return countWords(remainder) >= 2 ? remainder : '';
}

function readPrompt(text: string, bangla: boolean) {
  const lines = bangla
    ? ['Repeat the following text exactly.', 'Output nothing else.']
    : ['Speak in a clear Indian English accent.', 'Do not use an American accent.', 'Repeat the following text exactly.', 'Output nothing else.'];
  return [...lines, '', text].join('\n');
}

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);
  private client: GoogleGenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  speak(text: string, onEvent: (event: SpeechEvent) => void, signal?: AbortSignal): Promise<void> {
    const client = this.getClient();
    const segments = splitForSpeech(text);
    const bangla = BENGALI_SCRIPT.test(text);

    return new Promise<void>((resolve) => {
      let session: Session | null = null;
      let finished = false;
      let gotAudio = false;
      let segmentIndex = 0;
      let continuations = 0;
      let turnText = '';
      let turnTranscript = '';
      let turnAudioBytes = 0;
      let turnHandled = false;
      let idleTimer: ReturnType<typeof setTimeout> | null = null;

      const finish = (result: { ok: true } | { ok: false; error: string }) => {
        if (finished) return;
        finished = true;
        clearTimeout(overallTimer);
        if (idleTimer) clearTimeout(idleTimer);
        try {
          session?.close();
        } catch {
          void 0;
        }
        if (!result.ok) this.logger.warn(`TTS failed: ${result.error}`);
        onEvent(result.ok ? { event: 'end', ok: true } : { event: 'end', ok: false, error: result.error });
        resolve();
      };

      const overallTimer = setTimeout(
        () => finish({ ok: false, error: 'Speech request timed out.' }),
        Math.min(180_000, 30_000 + text.length * 150),
      );

      const armIdle = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => finish({ ok: false, error: 'Speech stopped responding.' }), IDLE_TIMEOUT_MS);
      };

      signal?.addEventListener('abort', () => finish({ ok: false, error: 'Client cancelled the speech request.' }), { once: true });

      const sendTurn = (textToRead: string) => {
        turnText = textToRead;
        turnTranscript = '';
        turnAudioBytes = 0;
        turnHandled = false;
        armIdle();
        session?.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: readPrompt(textToRead, bangla) }] }],
          turnComplete: true,
        });
      };

      const onTurnComplete = () => {
        if (turnHandled) return;
        turnHandled = true;
        const remainder = unspokenRemainder(turnText, turnTranscript, turnAudioBytes / 2 / TTS_SAMPLE_RATE);

        if (remainder && continuations < MAX_CONTINUATIONS) {
          continuations += 1;
          sendTurn(remainder);
          return;
        }

        segmentIndex += 1;
        continuations = 0;
        if (segmentIndex < segments.length) {
          sendTurn(segments[segmentIndex]);
          return;
        }

        finish(gotAudio ? { ok: true } : { ok: false, error: 'No audio was generated.' });
      };

      const onMessage = (message: LiveServerMessage) => {
        if (finished) return;
        armIdle();
        const content = message.serverContent;

        const transcriptPart = content?.outputTranscription?.text;
        if (transcriptPart) turnTranscript += transcriptPart;

        for (const part of content?.modelTurn?.parts ?? []) {
          const data = part.inlineData?.data;
          const mimeType = part.inlineData?.mimeType ?? '';
          if (!data || (mimeType && !mimeType.startsWith('audio/pcm'))) continue;

          const pcm = Buffer.from(data, 'base64');
          if (!pcm.length) continue;
          gotAudio = true;
          turnAudioBytes += pcm.length;
          onEvent({ event: 'chunk', pcm });
        }

        if (content?.generationComplete) {
          onTurnComplete();
        } else if (content?.turnComplete && !turnHandled && !content.interrupted && turnAudioBytes > 0) {
          onTurnComplete();
        }
      };

      client.live
        .connect({
          model: TTS_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE } } },
          },
          callbacks: {
            onopen: () => onEvent({ event: 'start', sampleRate: TTS_SAMPLE_RATE }),
            onmessage: onMessage,
            onerror: (event: ErrorEvent) => finish({ ok: false, error: event.message || 'Speech connection error.' }),
            onclose: () => finish({ ok: false, error: 'Speech connection closed early.' }),
          },
        })
        .then((connected) => {
          session = connected;
          if (finished) {
            connected.close();
            return;
          }
          sendTurn(segments[0] ?? text);
        })
        .catch((error: unknown) => finish({ ok: false, error: error instanceof Error ? error.message : 'Speech connection failed.' }));
    });
  }

  openTranscription(language: SpeechLanguage, handlers: TranscriptionHandlers): Promise<TranscriptionSession> {
    const languageCodes = language === 'bn-BD' ? ['bn-BD', 'en-US'] : ['en-US'];

    return this.getClient().live.connect({
      model: STT_MODEL,
      config: {
        responseModalities: [Modality.TEXT],
        inputAudioTranscription: { languageCodes, mode: AudioTranscriptionConfigMode.VERBATIM },
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const content = message.serverContent;
          if (!content) return;

          const interim = content.interimInputTranscription?.text;
          if (interim) handlers.onInterim(interim);

          const transcript = content.inputTranscription?.text;
          if (transcript) handlers.onTranscript(transcript);

          if (content.turnComplete || content.interrupted) handlers.onTurnEnd();
        },
        onerror: (event: ErrorEvent) => {
          this.logger.warn(`STT error: ${event.message}`);
          handlers.onError(event.message || 'Transcription failed.');
        },
        onclose: () => handlers.onClose(),
      },
    });
  }

  sendAudio(session: TranscriptionSession, pcm: Buffer, sampleRate: number) {
    session.sendRealtimeInput({ audio: { data: pcm.toString('base64'), mimeType: `audio/pcm;rate=${sampleRate}` } });
  }

  endAudio(session: TranscriptionSession) {
    session.sendRealtimeInput({ audioStreamEnd: true });
  }

  private getClient() {
    if (this.client) return this.client;
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) throw new ServiceUnavailableException('Interview voice is not configured.');
    this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }
}
