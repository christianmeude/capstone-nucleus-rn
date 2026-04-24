# NUcleus React Native (Student)

React Native/Expo mobile app for student workflows in NUcleus, integrated with the existing Express backend.

## Implemented (Initial)
- Student login (token + refresh session handling)
- Student-only route guard (non-student accounts blocked)
- Dashboard (status summaries + recent papers)
- My Papers (filters + search)
- Repository browse (published papers + category filter)
- Research Detail (workflow timeline + PDF open)
- Notifications (unread tracking, mark read, mark all read)
- Co-author Invitations (list, accept, decline)

## Explicitly Excluded
- Submit research flow
- Draft saving/updating/deleting
- Faculty/Dean/Program Chair/Staff/Admin features

## Tech Stack
- Expo + React Native + TypeScript
- React Navigation (stack + bottom tabs)
- Axios + AsyncStorage token persistence

## Setup
1. Install dependencies
```bash
npm install
```

2. Configure environment
- Copy `.env.example` to `.env`
- Set `EXPO_PUBLIC_API_URL`

3. Run app
```bash
npm run start
```

## Backend Compatibility
Expected backend base URL shape:
- `http://<host>:5000/api`

Used endpoint groups:
- `/auth/login`, `/auth/refresh`, `/auth/me`
- `/research/my/papers`, `/research/published`, `/research/categories`
- `/research/:id`, `/research/:id/file`, `/research/:id/view`, `/research/:id/download`
- `/auth/notifications`, `/auth/notifications/unread-count`, `/auth/notifications/:id/read`, `/auth/notifications/read-all`
- `/auth/co-author-invitations`, `/auth/co-author-invitations/:token/accept`, `/auth/co-author-invitations/:token/decline`

## Notes
- This app is intentionally scoped to student workflows and read-first behavior.
- Data parity is maintained by consuming the same Express API used by the web app.
