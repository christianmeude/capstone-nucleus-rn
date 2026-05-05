# NUcleus Mobile

NUcleus Mobile is a React Native (Expo) app for enrolled students at National University — Dasmariñas. It provides a mobile interface for browsing research, reading paper details, and managing student notifications and invitations.

## Features

- Student authentication and session persistence
- Browse published research
- View research details and PDF links
- Access My Papers and dashboard summaries
- Manage notifications and co-author invitations

## Tech Stack

- React Native (Expo)
- TypeScript
- Supabase (Auth, Database, Storage)
- React Navigation
- AsyncStorage

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

Create a `.env` file from `.env.example` and set:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the app

```bash
npm run start
```

## Project Structure

```text
src/
  api/
  auth/
  config/
  context/
  lib/
  navigation/
  screens/
  storage/
  types/
  utils/
docs/
  PROJECT_CONTEXT.md
  plans/
    SUPABASE_MIGRATION.md
```

## Documentation

- [PROJECT_CONTEXT.md](./docs/PROJECT_CONTEXT.md)
- [SUPABASE_MIGRATION.md](./docs/plans/SUPABASE_MIGRATION.md)