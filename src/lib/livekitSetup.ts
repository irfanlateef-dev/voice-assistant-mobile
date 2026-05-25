import Constants, { ExecutionEnvironment } from 'expo-constants';

/** True when running inside the Expo Go app (no custom native modules). */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

export function isNativeDevBuild(): boolean {
  return !isExpoGo();
}

let livekitReady = false;

export function isLiveKitReady(): boolean {
  return livekitReady;
}

export async function setupLiveKit(): Promise<boolean> {
  if (isExpoGo()) {
    return false;
  }

  livekitReady = true;
  return true;
}

export const EXPO_GO_VOICE_MESSAGE =
  'Voice chat needs a development build. Run: npx expo run:android (or run:ios). Expo Go cannot use the microphone with LiveKit.';
