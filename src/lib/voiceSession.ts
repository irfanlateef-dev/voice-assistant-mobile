import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { AudioSession } from '@livekit/react-native';
import { Room, Track } from 'livekit-client';

let activeRoom: Room | null = null;
let activeOwnerId: string | null = null;

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

  if (activeRoom === room) {
    activeRoom = null;
    activeOwnerId = null;
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

export async function teardownActiveVoiceSession(): Promise<void> {
  const room = activeRoom;
  activeRoom = null;
  activeOwnerId = null;
  await teardownVoiceRoom(room);
}

export function registerActiveVoiceRoom(room: Room, ownerId: string): void {
  activeRoom = room;
  activeOwnerId = ownerId;
}

export async function ensureSingleVoiceRoom(ownerId: string): Promise<void> {
  if (activeRoom && activeOwnerId !== ownerId) {
    await teardownVoiceRoom(activeRoom);
  }
}
