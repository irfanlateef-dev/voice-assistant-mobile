import '@/lib/livekitPolyfills';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { AudioSession } from '@livekit/react-native';
import { Audio } from 'expo-av';
import {
  LocalParticipant,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
  TranscriptionSegment,
} from 'livekit-client';
import {
  config,
  STALL_TIMEOUT_MS,
  THINKING_STALL_TIMEOUT_MS,
} from '@/constants/config';
import {
  ensureSingleVoiceRoom,
  registerActiveVoiceRoom,
  teardownVoiceRoom,
} from '@/lib/voiceSession';
import { getToken } from '@/services/livekit.service';
import { getConfig } from '@/services/auth.service';
import { getErrorMessage } from '@/services/api';
import type {
  TranscriptEntry,
  VoiceAction,
  VoiceActionHandler,
  VoiceStatus,
} from '@/types/voice.types';
import { useHaptics } from '@/hooks/useHaptics';
import { isExpoGo, EXPO_GO_VOICE_MESSAGE } from '@/lib/livekitSetup';

const EXPO_GO_VOICE_ERROR = EXPO_GO_VOICE_MESSAGE;

function generateRoomId(): string {
  const random = Math.random().toString(36).slice(2, 7);
  return `cook-${Date.now().toString(36)}-${random}`;
}

function generateOwnerId(sessionId?: string): string {
  return sessionId ? `session-${sessionId}` : `new-${Date.now()}`;
}

interface UseVoiceAgentOptions {
  sessionId?: string;
  authReady?: boolean;
  onAction?: VoiceActionHandler;
}

export function useVoiceAgent({
  sessionId,
  authReady = true,
  onAction,
}: UseVoiceAgentOptions) {
  const ownerIdRef = useRef(generateOwnerId(sessionId));
  const roomRef = useRef<Room | null>(null);
  const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interruptedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasConnectedRef = useRef(false);
  const allowReconnectRef = useRef(false);
  const agentWasSpeakingRef = useRef(false);
  const onActionRef = useRef(onAction);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const connectGenerationRef = useRef(0);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [isStalled, setIsStalled] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [greeting, setGreeting] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const { lightImpact, mediumImpact, notificationSuccess, notificationError } =
    useHaptics();
  const previousStatusRef = useRef<VoiceStatus>('idle');

  useEffect(() => {
    onActionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    ownerIdRef.current = generateOwnerId(sessionId);
  }, [sessionId]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    isConnectingRef.current = isConnecting;
  }, [isConnecting]);

  const clearStallTimer = useCallback(() => {
    if (stallTimerRef.current) {
      clearTimeout(stallTimerRef.current);
      stallTimerRef.current = null;
    }
  }, []);

  const scheduleStallCheck = useCallback(() => {
    clearStallTimer();
    const timeout = isThinking ? THINKING_STALL_TIMEOUT_MS : STALL_TIMEOUT_MS;
    stallTimerRef.current = setTimeout(() => {
      setIsStalled(true);
      notificationError();
    }, timeout);
  }, [clearStallTimer, isThinking, notificationError]);

  const flashInterrupted = useCallback(() => {
    setIsInterrupted(true);
    if (interruptedTimerRef.current) {
      clearTimeout(interruptedTimerRef.current);
    }
    interruptedTimerRef.current = setTimeout(() => {
      setIsInterrupted(false);
    }, 800);
  }, []);

  const resetLocalState = useCallback(() => {
    setTranscript([]);
    setIsStalled(false);
    setIsThinking(false);
    setIsInterrupted(false);
    setIsMuted(false);
    setConnectError(null);
    setIsAgentSpeaking(false);
    setIsUserSpeaking(false);
    setIsAgentReady(false);
    setIsConnected(false);
    setIsConnecting(false);
    agentWasSpeakingRef.current = false;
    wasConnectedRef.current = false;
    allowReconnectRef.current = false;
    isConnectedRef.current = false;
    isConnectingRef.current = false;
  }, []);

  const updateTranscript = useCallback(
    (segments: TranscriptionSegment[], role: 'user' | 'assistant') => {
      setTranscript((prev) => {
        const updated = [...prev];
        segments.forEach((segment) => {
          const entry: TranscriptEntry = {
            id: segment.id,
            role,
            text: segment.text,
            interim: !segment.final,
          };
          const index = updated.findIndex((item) => item.id === entry.id);
          if (index >= 0) {
            updated[index] = entry;
          } else {
            updated.push(entry);
          }
        });
        return updated;
      });
    },
    [],
  );

  const attachRemoteAudio = useCallback(
    (track: RemoteTrack, participant: RemoteParticipant, room: Room) => {
      if (track.kind !== Track.Kind.Audio) {
        return;
      }

      // React Native plays remote audio through WebRTC natively — no DOM attach.
      if (Platform.OS === 'web') {
        track.attach();
      }

      if (participant.identity !== room.localParticipant.identity) {
        setIsAgentReady(true);
      }
    },
    [],
  );

  const resolveTranscriptRole = useCallback(
    (room: Room, participant?: Participant): 'user' | 'assistant' => {
      if (participant instanceof LocalParticipant) {
        return 'user';
      }

      const localIdentity = room.localParticipant.identity;
      if (participant?.identity && participant.identity === localIdentity) {
        return 'user';
      }

      return 'assistant';
    },
    [],
  );

  const setupRoomListeners = useCallback(
    (room: Room) => {
      room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
        attachRemoteAudio(track as RemoteTrack, participant, room);
      });

      room.on(
        RoomEvent.TranscriptionReceived,
        (segments, participant) => {
          updateTranscript(
            segments,
            resolveTranscriptRole(room, participant),
          );
        },
      );

      room.on(RoomEvent.DataReceived, (payload) => {
        try {
          const decoded = new TextDecoder().decode(payload);
          const data = JSON.parse(decoded) as VoiceAction;
          if (data.type === 'action') {
            if (data.action === 'tool_called') {
              setIsThinking(true);
            }
            if (data.action === 'session_completed') {
              notificationSuccess();
            }
            onActionRef.current?.(data.action, data.payload);
          }
        } catch {
          // Ignore malformed payloads
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const localIdentity = room.localParticipant.identity;
        const agentSpeaking = speakers.some(
          (speaker) => speaker.identity !== localIdentity,
        );
        const userSpeaking = speakers.some(
          (speaker) => speaker.identity === localIdentity,
        );

        if (agentWasSpeakingRef.current && !agentSpeaking && userSpeaking) {
          flashInterrupted();
        }

        agentWasSpeakingRef.current = agentSpeaking;
        setIsAgentSpeaking(agentSpeaking);
        setIsUserSpeaking(userSpeaking);

        if (agentSpeaking) {
          setIsThinking(false);
          clearStallTimer();
          setIsStalled(false);
        } else if (!userSpeaking) {
          scheduleStallCheck();
        } else {
          clearStallTimer();
          setIsStalled(false);
        }
      });

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setIsConnecting(false);
        setIsAgentReady(false);
        setIsAgentSpeaking(false);
        setIsUserSpeaking(false);
        clearStallTimer();
      });

      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        if (participant.identity !== room.localParticipant.identity) {
          setIsAgentReady(true);
        }
      });
    },
    [
      attachRemoteAudio,
      clearStallTimer,
      flashInterrupted,
      notificationSuccess,
      onActionRef,
      resolveTranscriptRole,
      scheduleStallCheck,
      updateTranscript,
    ],
  );

  const disconnect = useCallback(async () => {
    clearStallTimer();
    setIsDisconnecting(true);
    allowReconnectRef.current = false;

    const room = roomRef.current;
    roomRef.current = null;

    if (room) {
      await teardownVoiceRoom(room);
    }

    isConnectedRef.current = false;
    isConnectingRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
    setIsAgentReady(false);
    setIsDisconnecting(false);
  }, [clearStallTimer]);

  const fullReset = useCallback(async () => {
    connectGenerationRef.current += 1;
    await disconnect();
    resetLocalState();
  }, [disconnect, resetLocalState]);

  const connect = useCallback(async () => {
    if (!authReady || isConnectingRef.current || isConnectedRef.current) {
      return;
    }

    if (isExpoGo()) {
      setConnectError(EXPO_GO_VOICE_ERROR);
      return;
    }

    const generation = connectGenerationRef.current + 1;
    connectGenerationRef.current = generation;

    setConnectError(null);
    isConnectingRef.current = true;
    setIsConnecting(true);
    setIsStalled(false);

    try {
      await ensureSingleVoiceRoom(ownerIdRef.current);
      await AudioSession.startAudioSession();

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const roomId = generateRoomId();
      const token = await getToken(roomId, sessionId);

      if (generation !== connectGenerationRef.current) {
        return;
      }

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;
      registerActiveVoiceRoom(room, ownerIdRef.current);
      setupRoomListeners(room);

      await room.connect(config.livekitUrl, token, {
        autoSubscribe: true,
      });

      if (generation !== connectGenerationRef.current) {
        await teardownVoiceRoom(room);
        roomRef.current = null;
        return;
      }

      await room.localParticipant.setMicrophoneEnabled(true);
      isConnectedRef.current = true;
      isConnectingRef.current = false;
      setIsConnected(true);
      setIsConnecting(false);
      wasConnectedRef.current = true;
      allowReconnectRef.current = true;

      room.remoteParticipants.forEach((participant) => {
        if (participant.identity !== room.localParticipant.identity) {
          setIsAgentReady(true);
        }
      });

      try {
        const configResponse = await getConfig();
        setGreeting(configResponse.agent.greeting);
      } catch {
        setGreeting('Hi! I\'m Grace, your AI cooking assistant.');
      }
    } catch (error) {
      if (generation !== connectGenerationRef.current) {
        return;
      }
      setConnectError(getErrorMessage(error));
      isConnectingRef.current = false;
      isConnectedRef.current = false;
      setIsConnecting(false);
      setIsConnected(false);
      const failedRoom = roomRef.current;
      roomRef.current = null;
      if (failedRoom) {
        await teardownVoiceRoom(failedRoom);
      }
    }
  }, [authReady, sessionId, setupRoomListeners]);

  const reconnect = useCallback(async () => {
    await fullReset();
    await connect();
  }, [connect, fullReset]);

  const toggleMute = useCallback(async () => {
    const room = roomRef.current;
    if (!room) {
      return;
    }
    const nextMuted = !isMuted;
    await room.localParticipant.setMicrophoneEnabled(!nextMuted);
    setIsMuted(nextMuted);
  }, [isMuted]);

  const status: VoiceStatus = useMemo(() => {
    if (!isConnected && !isConnecting) {
      return 'idle';
    }
    if (isConnecting || (isConnected && !isAgentReady)) {
      return 'connecting';
    }
    if (isStalled) {
      return 'stalled';
    }
    if (isInterrupted) {
      return 'interrupted';
    }
    if (isAgentSpeaking) {
      return 'speaking';
    }
    if (isThinking) {
      return 'thinking';
    }
    return 'listening';
  }, [
    isAgentReady,
    isAgentSpeaking,
    isConnected,
    isConnecting,
    isInterrupted,
    isStalled,
    isThinking,
  ]);

  useEffect(() => {
    const prev = previousStatusRef.current;
    if (prev !== status) {
      if (status === 'listening') {
        lightImpact();
      } else if (status === 'speaking') {
        mediumImpact();
      } else if (status === 'stalled') {
        notificationError();
      }
      previousStatusRef.current = status;
    }
  }, [status, lightImpact, mediumImpact, notificationError]);

  useEffect(() => {
    return () => {
      clearStallTimer();
      if (interruptedTimerRef.current) {
        clearTimeout(interruptedTimerRef.current);
      }
      void fullReset();
    };
  }, [clearStallTimer, fullReset]);

  return {
    connect,
    disconnect,
    reconnect,
    fullReset,
    isConnected,
    isAgentReady,
    isConnecting,
    isDisconnecting,
    isStalled,
    isThinking,
    status,
    transcript,
    isMuted,
    toggleMute,
    greeting,
    connectError,
    wasConnected: wasConnectedRef.current,
    allowReconnect: allowReconnectRef.current,
  };
}
