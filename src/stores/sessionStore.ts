import { create } from 'zustand';

interface SessionState {
  activeSessionId: string | null;
  setActiveSessionId: (sessionId: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  activeSessionId: null,
  setActiveSessionId: (sessionId) => set({ activeSessionId: sessionId }),
}));
