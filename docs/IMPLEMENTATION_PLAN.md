# NUcleus Mobile — Implementation Plan: Express → Direct Supabase

This plan describes how to migrate the React Native app from an **Express-backend API** architecture to **direct Supabase** integration (Auth, Postgres with RLS, Storage), incrementally and without a full rewrite.

**Canonical product context:** [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)

**Constraints:**

- Do **not** add research **submission** workflow or non-student features.
- Prefer **incremental** replacement of the data layer; keep screens and navigation stable.
- Use the **web app** (`capstone-nucleus`) for schema, RLS, and workflow semantics; use the **Flutter app** (`capstone-nucleus-mobile`) for **how** direct Supabase is used on mobile (tables, queries, storage patterns).

---

## 1. Current architecture (as implemented)

### 1.1 HTTP and auth pipeline

- **`src/api/http.ts`:** Axios instance with `baseURL` from `EXPO_PUBLIC_API_URL` (`src/config/env.ts`). Injects `Authorization: Bearer <access>`. On **401**, posts to **`/auth/refresh`** with the refresh token, updates AsyncStorage, retries the request; avoids refresh loops for login/refresh routes.
- **`src/storage/authStorage.ts`:** AsyncStorage keys for access and refresh tokens.
- **`src/context/AuthContext.tsx`:**  
  - **Sign-in:** `authApi.login` → stores tokens → sets `user`.  
  - **Bootstrap:** reads tokens → `authApi.getCurrentUser()` (`/auth/me`). On failure, clears tokens.

### 1.2 API modules (Express endpoints)

| Module | Responsibility | Current routes |
|--------|----------------|----------------|
| `src/api/auth.ts` | Login, register (unused in UI), refresh helper, current user, submission policy | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/refresh`, `GET /auth/submission-policy` |
| `src/api/research.ts` | My papers, published browse, categories, detail + workflow, file URL, view/download tracking, profile data | `GET /research/my/papers`, `GET /research/published`, `GET /research/categories`, `GET /research/:id`, `GET /research/:id/file`, `POST /research/:id/view`, `POST /research/:id/download`, `GET /research/profile/data` |
| `src/api/notifications.ts` | List, unread count, mark read, mark all | `GET /auth/notifications`, `GET /auth/notifications/unread-count`, `PATCH /auth/notifications/:id/read`, `PATCH /auth/notifications/read-all` |
| `src/api/invitations.ts` | List, accept, decline | `GET /auth/co-author-invitations`, `POST .../accept`, `POST .../decline` |
| `src/api/helpers.ts` | `unwrapApiData`, Express-style `getApiErrorMessage` | N/A |

### 1.3 UI consumers (preserve behavior)

- **Auth:** `LoginScreen`, `UnsupportedRoleScreen`, `AppNavigator` gating.
- **Research:** `BrowseScreen`, `MyPapersScreen`, `DashboardScreen`, `ResearchDetailScreen` (detail, workflow, `trackView`, `getResearchFile`, `trackDownload` for open flow).
- **Notifications / invitations:** `NotificationsScreen`, `InvitationsScreen`.

### 1.4 Dependency inventory

- **No** `@supabase/supabase-js` in `package.json` today.
- **Axios** is the sole HTTP client for backend calls.

---

## 2. Target architecture

### 2.1 High-level

```mermaid
flowchart LR
  subgraph rn [NUcleusMobile]
    UI[Screens_Navigation]
    AC[AuthContext]
    SF[Supabase_facades]
  end
  subgraph sb [Supabase]
    SA[Auth]
    DB[Postgres_RLS]
    ST[Storage]
  end
  UI --> AC
  UI --> SF
  AC --> SA
  SF --> DB
  SF --> ST
```

- One **Supabase client** (recommended location: e.g. `src/lib/supabase.ts`), created with `createClient(url, anonKey, { auth: { storage: AsyncStorageAdapter, ... } })` following current Supabase docs for React Native / Expo.
- **Auth:** `signInWithPassword`, `signOut`, `onAuthStateChange` for session lifecycle.
- **Data:** PostgREST selects/updates or RPCs permitted by RLS—exact queries must match **web + Flutter** (`research_papers`, `users`, `research_categories`, etc., as used in Flutter `supabase_service.dart`).
- **Storage:** Bucket access consistent with web policies (Flutter references bucket name `research-papers` and table `research_papers`).

### 2.2 Preserve vs replace

| Preserve | Replace / refactor |
|----------|---------------------|
| Screen components and **navigation** structure (`AppNavigator`, route types) | `src/api/http.ts` and Axios interceptors |
| **Domain types** in `src/types/domain.ts` (map DB rows → these shapes) | Manual JWT refresh + `/auth/refresh` |
| **AuthContext API surface** (`signIn`, `signOut`, `user`, `loading`, `refreshCurrentUser`) — keep signatures where possible | Implementation: swap internals to Supabase; token storage may delegate to Supabase session |
| Student-only **role guard** | `EXPO_PUBLIC_API_URL` as required config |
| Module names as **facades** (`researchApi`, `notificationsApi`, …) reimplemented with Supabase | `getApiErrorMessage` / `unwrapApiData` for Express responses |

---

## 3. Phased migration (incremental)

### Phase 0 — Discovery (no app release dependency)

- In **web** repo: locate schema (migrations, types, or admin SQL), RLS policies, and any **RPCs** the web uses for view/download counts, notifications, invitations.
- In **Flutter** `lib/data/services/supabase_service.dart` and `research_repository.dart`: document table names, filters for “published” vs “my papers”, and storage URL construction.
- Produce a short **internal** mapping from each Express route to the chosen Supabase operation (see section 4). Adjust this plan’s table if the web uses views or RPCs not visible in Flutter.

### Phase 1 — Foundation

- Add `@supabase/supabase-js` (and any official AsyncStorage auth helper if recommended for your Expo version).
- Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` to `.env.example` and document in README.
- Implement `createClient` with persistent auth.
- **Do not** remove Express yet: either keep both during development or use a **feature flag** / branch strategy so the app can be tested phase-by-phase.

**Exit criteria:** App builds; Supabase client initializes; no user-facing change required yet.

### Phase 2 — Auth and session

✅ **COMPLETED**

- ✅ Replaced `authApi.login` with `supabase.auth.signInWithPassword`
- ✅ Implemented strict profile resolution from `public.users` by email (fixed schema: use `first_name`, `middle_name`, `last_name`, not `full_name`)
- ✅ Removed temporary fallback profile generation; missing `public.users` row now causes sign-in to fail with a provisioning error
- ✅ Enforces **student-only** after profile load (checked before navigation)
- ✅ **Bootstrap:** uses `onAuthStateChange` with AsyncStorage session persistence (no Express `/auth/me`); rejects sessions if profile row missing
- ✅ **Sign out:** `supabase.auth.signOut()` with app state cleanup
- ✅ Removed Express `authApi` dependency from AuthContext
- ✅ Auth → `public.users` join is **email-based**, aligned with web backend provisioning contract

**Exit criteria met:** Login, cold start session restore, sign-out, student gate all working with strict profile provisioning; TypeScript clean. **Fallback behavior is no longer part of the normal auth path.** All authenticated users must have a corresponding `public.users` row or login is rejected.

### Phase 3 — Research lists and detail

⏳ **NEXT PRIORITY**

Reimplement in `src/api/research.ts`:

- `getMyPapers` — align with Flutter's "my research" query (author scoped).
- `getPublishedPapers` / `getCategories` — match published filters and category source (`research_categories` per Flutter).
- `getResearchById` — paper row + workflow history (tables/views used by web or Flutter for workflow timeline).

Stop routing these through Axios. Current state: **screens render but show empty** (still calling Express).

**Exit criteria:** Browse, My Papers, Dashboard, Research Detail load data from Supabase; workflow section consistent with data availability.

### Phase 4 — Views, downloads, and files

- **View/download tracking:** Express uses `POST .../view` and `POST .../download`. Replace with the **same semantics** the database expects—often inserts into audit tables (Flutter references `paper_downloads` for downloads) or RPCs. Confirm in web/Flutter; do not invent counters client-side only if the backend expects server-side consistency.
- **`getResearchFile`:** Replace with Storage **`createSignedUrl`** or public URL logic matching bucket policies (`research-papers` bucket in Flutter). Preserve `ResearchDetailScreen` behavior: resolve URL → `WebBrowser.openBrowserAsync`.

**Exit criteria:** Open PDF works for permitted papers; view/download counts acceptable vs web.

### Phase 5 — Notifications

Replace `notificationsApi` with Supabase queries/updates. Exact table names (e.g. `notifications`) and column names must come from the **web** schema. Preserve:

- List with limit
- Unread count
- Mark one read, mark all read

**Exit criteria:** `NotificationsScreen` behavior matches pre-migration UX.

### Phase 6 — Co-author invitations

Replace `invitationsApi` with Supabase operations matching **web** invitation model (status transitions, token usage). Preserve list, accept, and decline flows.

**Exit criteria:** `InvitationsScreen` works end-to-end with RLS.

### Phase 7 — Cleanup and documentation

- Remove `src/api/http.ts` and unused Axios imports.
- Remove or narrow `src/api/helpers.ts` to Supabase error messaging.
- Remove `EXPO_PUBLIC_API_URL` from required config if no longer used.
- Delete or stop exporting **unused** `authApi.register`, `getSubmissionPolicy`, and any research “profile data” only used for non-student features—**only** after confirming no screen imports them.
- Update `README.md` and `.env.example` for Supabase-only setup.
- Mark [TRANSITION_HANDOFF.md](./TRANSITION_HANDOFF.md) as **historical** for Express mapping (see PROJECT_CONTEXT).

**Exit criteria:** No dead Express code paths; env docs accurate.

---

## 4. API → Supabase replacement matrix

Use this as a **checklist**. Phases 0–2 now complete; Phase 3 begins below.

**Phase 2 (Auth) — COMPLETED:**
| Express (current) | Role | Supabase approach | Status |
|-------------------|------|-------------------|--------|
| `POST /auth/login` | Auth | `auth.signInWithPassword` + profile `select` on `users` | ✅ Done |
| `POST /auth/refresh` | Token refresh | Supabase client handles refresh automatically | ✅ Done |
| `GET /auth/me` | Current user | Session + profile query via `fetchAppUserProfile()` | ✅ Done |

**Phase 3+ (Data) — IN PROGRESS:**

| Express (current) | Role | Supabase approach | Status |
|-------------------|------|-------------------|--------|
| `POST /auth/register` | Register | **Out of mobile V1 scope** unless product adds register screen | ⏳ Not needed |
| `GET /auth/submission-policy` | Submission config | **Remove** (submission excluded from mobile) | ⏳ Not needed |

**Phase 3–4 (Research, files):**
| Express (current) | Role | Supabase approach | Status |
|-------------------|------|-------------------|--------|
| `GET /research/my/papers` | My papers | `select` on `research_papers` filtered by author | ⏳ Phase 3 |
| `GET /research/published` | Browse | `select` with published/approved filters | ⏳ Phase 3 |
| `GET /research/categories` | Categories | `select` on `research_categories` | ⏳ Phase 3 |
| `GET /research/:id` | Detail + workflow | `select` + workflow query or view | ⏳ Phase 3 |
| `GET /research/:id/file` | File URL | Storage signed URL | ⏳ Phase 4 |
| `POST /research/:id/view` | View tracking | Insert/RPC per web | ⏳ Phase 4 |
| `POST /research/:id/download` | Download tracking | Insert `paper_downloads` or RPC | ⏳ Phase 4 |
| `GET /research/profile/data` | Profile analytics | Optional: remove if unused | ⏳ Later |
| `GET /auth/notifications` | List | `select` on notifications table | ⏳ Phase 5 |
| `GET /auth/notifications/unread-count` | Count | `count()` query | ⏳ Phase 5 |
| `PATCH /auth/notifications/:id/read` | Mark read | `update` row | ⏳ Phase 5 |
| `PATCH /auth/notifications/read-all` | Mark all | `update` batch or RPC | ⏳ Phase 5 |
| `GET /auth/co-author-invitations` | List | `select` on invitation table | ⏳ Phase 6 |
| `POST .../:token/accept` | Accept | `update` / RPC | ⏳ Phase 6 |
| `POST .../:token/decline` | Decline | `update` / RPC | ⏳ Phase 6 |

---

## 5. Auth and session (technical notes)

- **Listeners:** Subscribe to `onAuthStateChange` in one place (often near root or inside `AuthProvider`) to keep `user` in sync when tokens refresh or session expires.
- **Profile vs auth user:** Supabase Auth `user.id` may align with `users.id` in your schema—confirm in web migrations. If email is the join key, handle case normalization consistently with Flutter (`ilike` patterns).
- **Non-student roles:** After loading profile, if `role !== 'student'`, navigate to **Unsupported Role** without granting tab access (existing navigator logic).

---

## 6. Storage and PDF handling

- Mirror Flutter: resolve storage path from `research_papers` (or equivalent) and build **signed** or **public** URL for bucket **`research-papers`** (name from Flutter codebase; confirm in web).
- Respect `allow_download` / policy: if the web blocks download, mobile must not bypass RLS or bucket policies.
- Keep **`expo-web-browser`** (or current approach) for opening URLs unless product mandates an in-app PDF viewer later.

---

## 7. Notifications and invitations

- **Notifications:** Implement server-compatible updates so unread counts and read state remain consistent with web and other clients.
- **Invitations:** Accept/decline must match server-side state machine (pending → accepted/declined/expired) and any token validation the web enforces.

If Flutter’s notification UI is **derived** from papers rather than a dedicated table, prefer the **web** model for RN to stay aligned with the production schema.

---

## 8. Obsolete abstractions to remove (end state)

- `src/api/http.ts` (entire Axios + refresh interceptor).
- Express-specific response unwrapping where responses no longer exist.
- Duplicate token lifecycle if fully superseded by Supabase Auth session.

---

## 9. Validation and testing strategy

After **each phase**:

1. **TypeScript:** `npx tsc --noEmit` (add a `npm run typecheck` script if helpful).
2. **Manual smoke:**
   - Login / session restore / sign-out  
   - Non-student account → Unsupported Role  
   - Browse + filters, Research Detail, PDF open  
   - My Papers + Dashboard stats  
   - Notifications (read / mark all)  
   - Invitations (accept / decline)

Optional later: unit tests for Supabase facade functions with mocked client—only after the API surface stabilizes.

---

## 10. Non-goals (explicit)

- No **submission** or draft management on mobile.
- No **faculty/admin** surfaces.
- No **big-bang** rewrite: screens and navigation stay; **replace implementation** behind facades.

---

## 11. Reference files in this repo

| File | Migration relevance |
|------|---------------------|
| `src/api/http.ts` | Remove after migration (Phase 7) |
| `src/api/auth.ts` | ✅ No longer used (Phase 2 complete) |
| `src/api/research.ts` | Rewrite to Supabase (Phase 3) |
| `src/api/notifications.ts` | Rewrite to Supabase (Phase 5) |
| `src/api/invitations.ts` | Rewrite to Supabase (Phase 6) |
| `src/context/AuthContext.tsx` | ✅ Rewired to Supabase (Phase 2 complete) |
| `src/storage/authStorage.ts` | Shrink or remove (Phase 7) |
| `src/config/env.ts` | ✅ Updated with Supabase env vars (Phase 2 complete) |

---

## 12. Success criteria (project level)

- Mobile runs **without** a running Express server.
- Auth and data use **Supabase** with RLS behaving like web for student actions.
- Student-only scope and **no submission workflow** preserved.
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) remains accurate as the living **canonical** description of the app.
