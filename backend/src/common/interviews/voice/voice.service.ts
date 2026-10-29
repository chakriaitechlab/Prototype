import { ConflictException, Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { SpeechService, type SpeechLanguage, type TranscriptionSession } from '../../../infrastructure/speech/speech.service.js';
import { ConversationService, greetingText, INTERVIEW_SCRIPT } from '../conversation/conversation.service.js';
import { LANGUAGE_BY_CODE, SessionsService } from '../sessions/sessions.service.js';
import { SpeechRequestDto } from './dto/speech-request.dto.js';
import { TranscribeStartDto } from './dto/transcribe-start.dto.js';

const FLUSH_TIMEOUT_MS = 2000;
const MAX_RECONNECTS = 2;
// Ten seconds of 16 kHz PCM16 audio, held while the transcription provider connects.
const MAX_PENDING_AUDIO_BYTES = 320_000;

export interface TranscriptionEvents {
  interim: (text: string) => void;
  final: (text: string) => void;
  turnEnd: () => void;
  error: (message: string) => void;
}

interface ActiveTranscription {
  session: TranscriptionSession | null;
  sampleRate: number;
  language: SpeechLanguage;
  pending: Buffer[];
  pendingBytes: number;
  reconnects: number;
  flush: (() => void) | null;
}

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);
  private readonly transcriptions = new Map<string, ActiveTranscription>();

  constructor(
    private readonly speech: SpeechService,
    private readonly sessions: SessionsService,
    private readonly conversation: ConversationService,
  ) {}

  async streamSpeech(seekerId: string, interviewId: string, dto: SpeechRequestDto, res: Response) {
    const text = await this.speechText(seekerId, interviewId, dto);

    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Accel-Buffering', 'no');

    const clientGone = new AbortController();
    res.on('close', () => {
      if (!res.writableFinished) clientGone.abort();
    });

    const write = (line: object) => {
      if (!res.writableEnded && !res.destroyed) res.write(`${JSON.stringify(line)}\n`);
    };

    write({ event: 'text', text });

    try {
      await this.speech.speak(
        text,
        (event) => {
          if (event.event === 'chunk') write({ event: 'chunk', pcm: event.pcm.toString('base64') });
          else write(event);
        },
        clientGone.signal,
      );
    } catch (error) {
      write({ event: 'end', ok: false, error: error instanceof Error ? error.message : 'Speech failed.' });
    }
    if (!res.writableEnded) res.end();
  }

  async startTranscription(clientId: string, seekerId: string, dto: TranscribeStartDto, events: TranscriptionEvents) {
    const { interviewId, sampleRate } = dto;

    this.stopTranscription(clientId);
    const active: ActiveTranscription = { session: null, sampleRate, language: 'en-US', pending: [], pendingBytes: 0, reconnects: 0, flush: null };
    this.transcriptions.set(clientId, active);

    try {
      const interview = await this.sessions.findActive(seekerId, interviewId);
      active.language = interview.language === 'BANGLA' ? 'bn-BD' : 'en-US';
      await this.connectTranscription(clientId, active, events);
    } catch (error) {
      if (this.transcriptions.get(clientId) === active) this.transcriptions.delete(clientId);
      throw error;
    }
    return { ok: true };
  }

  sendAudio(clientId: string, chunk: Buffer) {
    const active = this.transcriptions.get(clientId);
    if (!active || !chunk.length) return;

    if (!active.session) {
      if (active.pendingBytes + chunk.length > MAX_PENDING_AUDIO_BYTES) return;
      active.pending.push(chunk);
      active.pendingBytes += chunk.length;
      return;
    }

    try {
      this.speech.sendAudio(active.session, chunk, active.sampleRate);
    } catch (error) {
      this.logger.warn(`Dropping audio for ${clientId}: ${(error as Error).message}`);
    }
  }

  async flushTranscription(clientId: string) {
    const active = this.transcriptions.get(clientId);
    const session = active?.session;
    if (!active || !session) {
      this.stopTranscription(clientId);
      return { ok: true };
    }

    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, FLUSH_TIMEOUT_MS);
      active.flush = () => {
        clearTimeout(timer);
        active.flush = null;
        resolve();
      };
      try {
        this.speech.endAudio(session);
      } catch {
        active.flush();
      }
    });
    this.stopTranscription(clientId);
    return { ok: true };
  }

  stopTranscription(clientId: string) {
    const active = this.transcriptions.get(clientId);
    if (!active) return;
    this.transcriptions.delete(clientId);
    try {
      active.session?.close();
    } catch {
      void 0;
    }
  }

  private async connectTranscription(clientId: string, active: ActiveTranscription, events: TranscriptionEvents) {
    let session: TranscriptionSession | null = null;
    const opened = await this.speech.openTranscription(active.language, {
      onInterim: events.interim,
      onTranscript: events.final,
      onTurnEnd: () => {
        events.turnEnd();
        active.flush?.();
      },
      onError: events.error,
      onClose: () => {
        if (session) this.onTranscriptionClosed(clientId, active, session, events);
      },
    });
    session = opened;

    if (this.transcriptions.get(clientId) !== active) {
      opened.close();
      return;
    }
    active.session = opened;
    const pending = active.pending;
    active.pending = [];
    active.pendingBytes = 0;
    pending.forEach((chunk) => this.sendAudio(clientId, chunk));
  }

  private onTranscriptionClosed(clientId: string, active: ActiveTranscription, session: TranscriptionSession, events: TranscriptionEvents) {
    if (active.session !== session) return;
    active.session = null;
    if (this.transcriptions.get(clientId) !== active) return;

    if (active.flush || active.reconnects >= MAX_RECONNECTS) {
      active.flush?.();
      this.transcriptions.delete(clientId);
      return;
    }

    active.reconnects += 1;
    this.connectTranscription(clientId, active, events).catch((error: unknown) => {
      this.logger.warn(`STT reconnect failed for ${clientId}: ${(error as Error).message}`);
      if (this.transcriptions.get(clientId) === active) this.transcriptions.delete(clientId);
      events.error('Transcription connection lost.');
    });
  }

  private async speechText(seekerId: string, interviewId: string, dto: SpeechRequestDto) {
    const { kind, language } = dto;

    if (kind === 'preview') {
      const interview = await this.sessions.get(seekerId, interviewId);
      return INTERVIEW_SCRIPT[LANGUAGE_BY_CODE[language ?? interview.language]].preview;
    }

    if (kind === 'closing') {
      const interview = await this.sessions.get(seekerId, interviewId);
      if (interview.status !== 'IN_PROGRESS' && interview.status !== 'COMPLETED') throw new ConflictException('This interview has not started');
      return INTERVIEW_SCRIPT[LANGUAGE_BY_CODE[interview.language]].closing;
    }

    const interview = await this.sessions.findActive(seekerId, interviewId);
    if (kind === 'greeting') {
      return greetingText(interview.language, interview.opportunity.title, this.sessions.companyOf(interview).name);
    }
    if (kind === 'question') {
      const turn = await this.conversation.currentTurn({
        id: interview.id,
        language: interview.language,
        skills: interview.skills,
        difficulty: interview.difficulty,
        jobTitle: interview.opportunity.title,
      });
      return turn.question;
    }
    return INTERVIEW_SCRIPT[interview.language][kind];
  }
}
