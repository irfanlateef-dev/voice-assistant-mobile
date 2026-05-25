import { create } from 'zustand';
import type { TranscriptEntry, VoiceStatus } from '@/types/voice.types';

interface VoiceState {
  status: VoiceStatus;
  transcript: TranscriptEntry[];
  isMuted: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isAgentReady: boolean;
  isThinking: boolean;
  isStalled: boolean;
  isInterrupted: boolean;
  greeting: string;
  setStatus: (status: VoiceStatus) => void;
  setTranscript: (transcript: TranscriptEntry[]) => void;
  addOrUpdateTranscript: (entry: TranscriptEntry) => void;
  setIsMuted: (isMuted: boolean) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setIsAgentReady: (isAgentReady: boolean) => void;
  setIsThinking: (isThinking: boolean) => void;
  setIsStalled: (isStalled: boolean) => void;
  setIsInterrupted: (isInterrupted: boolean) => void;
  setGreeting: (greeting: string) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as VoiceStatus,
  transcript: [] as TranscriptEntry[],
  isMuted: false,
  isConnected: false,
  isConnecting: false,
  isAgentReady: false,
  isThinking: false,
  isStalled: false,
  isInterrupted: false,
  greeting: '',
};

export const useVoiceStore = create<VoiceState>((set, get) => ({
  ...initialState,
  setStatus: (status) => set({ status }),
  setTranscript: (transcript) => set({ transcript }),
  addOrUpdateTranscript: (entry) => {
    const existing = get().transcript;
    const index = existing.findIndex((item) => item.id === entry.id);
    if (index >= 0) {
      const updated = [...existing];
      updated[index] = entry;
      set({ transcript: updated });
    } else {
      set({ transcript: [...existing, entry] });
    }
  },
  setIsMuted: (isMuted) => set({ isMuted }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setIsAgentReady: (isAgentReady) => set({ isAgentReady }),
  setIsThinking: (isThinking) => set({ isThinking }),
  setIsStalled: (isStalled) => set({ isStalled }),
  setIsInterrupted: (isInterrupted) => set({ isInterrupted }),
  setGreeting: (greeting) => set({ greeting }),
  reset: () => set(initialState),
}));
