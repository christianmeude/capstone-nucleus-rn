# NUcleus RN Transition Handoff

Date: 2026-04-24

## Current Goal
Build a React Native student-only mobile app with web parity for student workflows, excluding research submission.

## Implemented So Far
- Expo React Native app scaffolded in this folder.
- API client with backend base URL, auth header injection, refresh token retry flow, and normalized error handling.
- AsyncStorage token persistence.
- Auth context with session restore and sign-in/sign-out.
- Student-only route guard (non-student roles blocked).
- Navigation structure:
  - Login
  - Unsupported Role
  - Student bottom tabs
  - Research Detail stack route
- Student workflow screens (initial implementation):
  - Dashboard
  - My Papers
  - Browse Repository
  - Research Detail (includes workflow history and file open)
  - Notifications (mark one/all read)
  - Co-author Invitations (accept/decline)
- Submission flow intentionally excluded.
- README and .env example created.

## Key Files
- App bootstrap: App.tsx
- Gesture init: index.ts
- Env config: src/config/env.ts
- Token storage: src/storage/authStorage.ts
- HTTP client and refresh logic: src/api/http.ts
- Auth API: src/api/auth.ts
- Research API: src/api/research.ts
- Notifications API: src/api/notifications.ts
- Invitations API: src/api/invitations.ts
- Auth context: src/context/AuthContext.tsx
- Navigator: src/navigation/AppNavigator.tsx
- Route types: src/navigation/types.ts
- Auth screens: src/screens/auth/*
- Main screens: src/screens/main/*

## Scope Decisions (Locked)
- Login required.
- Student-only app surface.
- Keep student workflows except submission.
- Include notifications read actions and unread behavior.
- Include co-author invitation accept/decline.
- Use existing Express backend API (not direct Supabase in mobile).

## Excluded Features
- Submit research, draft save/update/delete.
- Faculty/dean/program chair/staff/admin workflows.
- Non-student route exposure.

## Backend Endpoint Groups Used
- Auth: /auth/login, /auth/refresh, /auth/me
- Research: /research/my/papers, /research/published, /research/categories
- Detail/File/Tracking: /research/:id, /research/:id/file, /research/:id/view, /research/:id/download
- Notifications: /auth/notifications, /auth/notifications/unread-count, /auth/notifications/:id/read, /auth/notifications/read-all
- Invitations: /auth/co-author-invitations, /auth/co-author-invitations/:token/accept, /auth/co-author-invitations/:token/decline

## How To Run
1. Ensure backend is running (capstone-nucleus/backend).
2. In this folder, install dependencies:
   - npm install
3. Create .env from .env.example and set EXPO_PUBLIC_API_URL.
4. Start Expo:
   - npm run start
5. Launch target:
   - Android emulator: press a in Expo terminal
   - iOS simulator (macOS): press i
   - Physical device: scan QR via Expo Go

## API URL Notes
- Android emulator: http://10.0.2.2:5000/api
- iOS simulator: http://localhost:5000/api
- Physical device: http://<LAN-IP>:5000/api

## Validation Done
- TypeScript check completed with no errors.

## Next Recommended Tasks
1. Add Register screen with department/program lookup for student onboarding parity.
2. Improve repository filters/sorting to match web behavior more closely.
3. Enhance research detail PDF experience and file fallback handling.
4. Add profile read-only screen if required for V1 parity.
5. Add lightweight tests for auth + API services.

## Continuation Prompt (for next workspace)
Use this prompt in the new workspace if needed:

"Continue implementation of the React Native app in this folder using TRANSITION_HANDOFF.md as source of truth. Keep student-only workflow parity with the web app, exclude submission, preserve existing architecture, and proceed with the Next Recommended Tasks in order. Validate TypeScript after each significant change and do not introduce non-student features."
