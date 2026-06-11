import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { AudioSession } from '@livekit/react-native';
import { Room, Track } from 'livekit-client';

let activeRoom: Room | null = null;
let activeOwnerId: string | null = null;

export interface VoiceSessionBridge {
  onExternalTeardown: () => Promise<void>;
}

let voiceSessionBridge: VoiceSessionBridge | null = null;

export function registerVoiceSessionBridge(
  bridge: VoiceSessionBridge | null,
): void {
  voiceSessionBridge = bridge;
}

function detachAllTracks(room: Room): void {
  room.localParticipant.trackPublications.forEach((publication) => {
    const track = publication.track;
    if (track) {
      if (Platform.OS === 'web' && track.kind === Track.Kind.Audio) {
        track.detach();
      }
      track.stop();
    }
  });

  room.remoteParticipants.forEach((participant) => {
    participant.trackPublications.forEach((publication) => {
      const track = publication.track;
      if (track) {
        if (Platform.OS === 'web') {
          track.detach();
        }
        track.stop();
      }
    });
  });
}

export async function teardownVoiceRoom(room: Room | null): Promise<void> {
  if (!room) {
    return;
  }

  if (activeRoom === room) {
    activeRoom = null;
    activeOwnerId = null;
  }

  try {
    room.removeAllListeners();

    detachAllTracks(room);

    if (room.localParticipant.isMicrophoneEnabled) {
      await room.localParticipant.setMicrophoneEnabled(false);
    }

    if (room.state !== 'disconnected') {
      await room.disconnect(true);
    }
  } catch {
    // Best-effort teardown
  }

  try {
    await AudioSession.stopAudioSession();
  } catch {
    // Audio session stop is best-effort
  }

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch {
    // Audio mode reset is best-effort
  }
}

/** Tear down LiveKit and sync the active useVoiceAgent hook (if mounted). */
export async function teardownActiveVoiceSession(): Promise<void> {
  if (voiceSessionBridge) {
    await voiceSessionBridge.onExternalTeardown();
    return;
  }

  const room = activeRoom;
  activeRoom = null;
  activeOwnerId = null;
  await teardownVoiceRoom(room);
}

export function registerActiveVoiceRoom(room: Room, ownerId: string): void {
  activeRoom = room;
  activeOwnerId = ownerId;
}

/** Always disconnect any existing room before opening a new one. */
export async function ensureSingleVoiceRoom(): Promise<void> {
  if (!activeRoom) {
    return;
  }

  const room = activeRoom;
  activeRoom = null;
  activeOwnerId = null;
  await teardownVoiceRoom(room);
}

export function getActiveVoiceOwnerId(): string | null {
  return activeOwnerId;
}
