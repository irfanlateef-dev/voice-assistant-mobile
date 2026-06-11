export type VoiceStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'interrupted'
  | 'stalled';

export type TranscriptRole = 'user' | 'assistant';

export interface TranscriptEntry {
  id: string;
  role: TranscriptRole;
  text: string;
  interim?: boolean;
}

export interface VoiceAction {
  type: 'action';
  action: string;
  payload?: Record<string, unknown>;
  sessionId?: string;
}

export interface VoiceActionHandler {
  (
    action: string,
    payload?: Record<string, unknown>,
    actionSessionId?: string,
  ): void;
}
