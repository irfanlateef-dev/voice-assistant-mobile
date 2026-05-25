# HomeChef AI (Mobile)

Voice-first React Native app for **HomeChef AI**. Grace, your AI cooking assistant, guides you through recipes hands-free via LiveKit real-time voice.

This repository contains the **mobile client only**. The Express API, LiveKit agent, and database run on a separate backend deployment.

## Features

- Email/password auth with secure token storage
- **Kitchen** — browse saved dishes, continue cooking, delete sessions
- **Cook** — live voice session with Grace, transcript, ingredients, steps, and notes
- Real-time session sync via LiveKit data channel actions
- Dev build with native microphone + WebRTC support (Expo Go cannot run voice)

## Tech stack

| Layer | Tools |
|--------|--------|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Routing | Expo Router 6 |
| Voice | LiveKit (`@livekit/react-native`, WebRTC) |
| Data | TanStack Query, Axios, Zustand |
| UI | React Native StyleSheet, Reanimated, Lucide icons |

## Prerequisites

- **Node.js** 20+ and npm
- **Android Studio** (Android SDK + emulator or USB device) for Android dev builds
- **Xcode** (macOS only) for iOS dev builds
- A running **HomeChef backend** with LiveKit agent configured

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and set your backend URLs:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_BASE` | Yes | Backend API base URL (e.g. `https://voice-assist.example.com`) |
| `EXPO_PUBLIC_LIVEKIT_URL` | Yes | LiveKit WebSocket URL (e.g. `wss://your-project.livekit.cloud`) |
| `EXPO_PUBLIC_MAX_COMPLETION_TOKENS` | No | Sent to `/api/token` as `max_completion_tokens`. Omit to use backend default. Backend must apply this to the agent LLM. |

Restart Metro after changing `.env` — `EXPO_PUBLIC_*` values are inlined at bundle time.

### 3. Run a development build (required for voice)

Voice uses native WebRTC modules. **Expo Go does not support this.** Use a dev client:

```bash
# Android (generates native project on first run if needed)
npm run android

# iOS (macOS only)
npm run ios
```

### 4. Start Metro for daily development

After the dev build is installed on your device/emulator:

```bash
npm start
```

Open the **HomeChef AI** app on the device (not the camera QR scanner / Expo Go).

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro with dev client |
| `npm run start:go` | Start Metro for Expo Go (UI only, no voice) |
| `npm run start:tunnel` | Dev client over tunnel (remote device testing) |
| `npm run android` | Build and run Android dev client |
| `npm run ios` | Build and run iOS dev client |
| `npm run lint` | Run Expo ESLint |

## Project structure

```
app/                    Expo Router screens
  (auth)/               Login & signup
  (app)/                Authenticated app
    index.tsx           Kitchen (dish list)
    cook/               Voice cooking flow
src/
  components/         UI, cooking, voice, layout
  hooks/              useVoiceAgent, useAuth, sessions
  services/           API & LiveKit token client
  lib/                  LiveKit setup, navigation, voice session
  constants/          Colors, config, typography
  types/                TypeScript models
```

## Backend API (external)

Protected routes use `Authorization: Bearer <token>`.

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/login` | Sign in |
| `POST /api/auth/signup` | Register |
| `GET /api/auth/me` | Current user |
| `GET /api/config` | Agent greeting & settings |
| `GET /api/token` | LiveKit room token (`room`, optional `sessionId`, optional `max_completion_tokens`) |
| `GET /api/sessions` | List cooking sessions |
| `GET /api/sessions/:id` | Session with ingredients & steps |
| `DELETE /api/sessions/:id` | Delete session |

## Voice troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Grace greets but never replies | Backend OpenRouter/LLM error (check agent Docker logs). Ensure `max_completion_tokens` is set on the **agent**, not only mobile. |
| No microphone / can't connect | Using Expo Go instead of dev build, or mic permission denied |
| Agent shows `trackPublications: []` | Mic track not published yet, or app disconnected before `setMicrophoneEnabled(true)` |
| Multiple agent jobs / timeouts | Rapid connect/disconnect — leave Cook tab stable for a few seconds after opening |
| `402` in agent logs | OpenRouter credits or `max_tokens` too high — lower agent `max_tokens` (e.g. 4096) |

Agent logs (on server):

```bash
docker logs -f --tail=200 voice-agent-agent-1
```

## Demo credentials

If your backend seeds a demo user:

- Email: `demo@voice-agent.local`
- Password: `demo1234`

(See `src/constants/config.ts` — for development only.)

## License

Private — all rights reserved.
