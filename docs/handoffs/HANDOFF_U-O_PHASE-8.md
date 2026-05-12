# NUcleus Mobile — Session Handoff Context

## Project Overview

React Native Expo app (`capstone-nucleus-rn`) migrated from Express backend to direct Supabase integration. Migration complete and stable. UI overhaul in progress on branch `feat/ui-overhaul`, Phases 1–8 complete, Phase 9 prompt ready.

**Canonical docs in the repo:**
- `docs/PROJECT_CONTEXT.md` — product identity, audience, navigation, domain types, principles
- `docs/PRODUCT_ROADMAP.md` — UX and design direction reference
- `docs/plans/SUPABASE_MIGRATION.md` — completed migration history, marked `[COMPLETED]`
- `docs/plans/UI_OVERHAUL.md` — active implementation plan, currently `[IN PROGRESS]`

**GitHub repo:** `christianmeude/capstone-nucleus-rn`

---

## Migration Status

Complete and stable. All phases done, all deferred issues resolved. See `docs/plans/SUPABASE_MIGRATION.md`.

---

## UI Overhaul Status

Currently on branch `feat/ui-overhaul`.

- ✅ Phase 1 — Design system foundation
- ✅ Phase 2 — Component system
- ✅ Phase 3 — Dashboard overhaul
- ✅ Phase 4 — MyPapers overhaul
- ✅ Phase 5 — Browse overhaul
- ✅ Phase 6 — Notifications overhaul
- ✅ Phase 7 — Invitations overhaul
- ✅ Phase 8 — ResearchDetail overhaul
- ⏳ Phase 9 — Polish and accessibility (prompt ready, not started)
- ⏳ Phase 10 — Validation and merge (not started)

---

## Critical Architectural Context

### Email-based RLS identity resolution
All mobile RLS policies resolve ownership via email:
```sql
user_id = (SELECT id FROM public.users WHERE email = auth.email())
```

### Auth architecture
- Mobile uses anon key + RLS
- Web backend uses service role key (bypasses RLS)
- Never use service role key on mobile
- `fetchAppUserProfile()` resolves by `auth.email()` against `public.users.email`

### users RLS recursion constraint
- `public.users` SELECT policy cannot reference itself — causes infinite recursion error `42P17`
- Cross-user profile reads go through `get_user_basic_info` SECURITY DEFINER RPC

### Domain type notes
- `public.users` has no `auth_id` column — email is the only bridge
- `User.fullName` is the only name field — first name derived via `user.fullName.trim().split(/\s+/)[0]`
- `PaperStatus` includes both `approved` and `published` as distinct values
- `statusToLabel()` in `src/utils/format.ts` is the canonical label source
- Notification domain type field is `is_read` (not `read`) — confirmed from source
- `CoAuthorInvitation.created_at` is `string | undefined` — guard before rendering

---

## GitHub Issues

**Closed:**
- ✅ #1 — View and download counts not persisting after navigation in ResearchDetailScreen
- ✅ #2 — UUID mismatch between auth.users and public.users causes RLS failures on mobile
- ✅ #3 — co_author_invitations PostgREST joins fail silently for research title and inviter name
- ✅ #4 — Published papers not showing view and download counts in ResearchCard

**Open:**
- 🔴 #5 — Browse category filter shows unresolved UUIDs — no real categories loading (backend, bug)
- 🔴 #6 — Browse: add toggleable list and tile view (enhancement)
- 🔴 #7 — Author name shows "Unknown" for non-uploaders in ResearchDetail and Browse (bug) — RLS issue on `public.users` join, needs dedicated Supabase investigation after overhaul
- 🔴 #8 — Download button always visible — no `allow_download` column on `research_papers` (bug) — needs confirmation from web backend team on enforcement approach

**Do not invent issue numbers beyond #8.**

---

## Current RLS Policy State

All policies use email-based resolution. See `docs/plans/SUPABASE_MIGRATION.md` for full SQL.

**Affected tables:** `notifications`, `co_author_invitations`, `research_papers`, `paper_views`, `paper_downloads`, `public.users`

---

## Supabase RPCs

- `increment_view_count(row_id uuid)` — SECURITY DEFINER
- `increment_download_count(row_id uuid)` — SECURITY DEFINER
- `get_user_basic_info(user_id uuid)` — SECURITY DEFINER, returns basic profile without triggering RLS recursion

---

## Current State of the Codebase

### Design system
- `src/theme/` — colors, typography, spacing, shadows, radii, index
- Fonts: Outfit (UI) + Lora (display/editorial — paper title in ResearchDetail only)
- All token consumption via direct `import { theme } from '../theme'` — no `useTheme()` hook

### Component system
- `src/components/ui/` — Surface, Card, PressableCard, Button, Chip, Badge, Stat, IconButton, EmptyState, Skeleton, InlineNotice, BottomSheet, Divider, Logo, OrbitalAccent
- `src/components/` — ResearchCard, NotificationCard, InvitationCard, PaperStatusChip

### Key component details

**ResearchCard props:**
- `paper`, `onPress` — always
- `showEngagementCounts` — default `false`, Browse passes `true`
- `showStatusChip` — default `true`, Browse passes `false`
- `keywords` — Browse only, capped at 4
- `categoryLine` — Browse only, renders above title as muted small text

**InvitationCard props:**
- `invitation`, `acting?`, `onAccept?`, `onDecline?`
- Status shown as 7×7 colored dot + formatted label below title
- `dotColorForStatus` preset preserved for future paper category color sorting feature
- Non-pending cards muted via `opacity: 0.5` on inner wrapper
- Conditional date rows: Invited (all statuses, when `created_at` exists), Expires (pending only), Expired (expired only)

**NotificationCard:**
- `notification: NotificationItem`, `onPress: () => void`
- Unread tint via `PressableCard` style prop using `theme.colors.brand.primarySurface`
- Field is `is_read` (not `read`)

**PaperStatusChip exports:**
- `ACTIVE_STATUSES`, `ACTION_STATUSES`, `PUBLISHED_STATUSES`
- Tone mapping: approved/published → success (green), revision_required → warning (orange), rejected → danger (red), pending variants → info (blue)

**Skeleton:**
- Props: `height`, `width`, `radius`
- Currently static — Phase 9 adds pulse animation

**EmptyState:**
- Props: `title`, `message?`, `icon?`
- `icon` must always be a rendered `<Ionicons />` node — never a string

**InlineNotice:**
- Props: `message`, `tone?: 'info' | 'success' | 'warning' | 'danger'`

**Button:**
- Variants: `primary`, `secondary`, `subtle`
- Sizes: `md`, `sm`
- Props: `label`, `onPress`, `disabled?`, `loading?`, `variant?`, `size?`, `accessibilityLabel?`

### Screen conventions
| Screen | engagementCounts | keywords | statusChip |
|---|---|---|---|
| Dashboard | ❌ | ❌ | ✅ |
| MyPapers | ❌ | ❌ | ✅ |
| Browse | ✅ | ✅ | ❌ |

### ResearchDetailScreen specifics
- `SafeAreaView` with `edges={['bottom']}` wrapping ScrollView — added post-Phase 8 to fix status bar overlap
- Title in Lora `display` scale — only Lora usage in the entire app
- `useAuth()` imported for `isOwner` check via `structured_authors`
- Workflow hidden for `approved`/`published` papers unless signed-in user is primary author
- Download button always shown — no `allow_download` column in schema (tracked as #8)
- `listCoAuthorNames` helper added to `src/utils/format.ts` in Phase 8 — shows names or "None"

### Active Supabase facades (frozen)
- `src/api/research.ts`
- `src/api/notifications.ts`
- `src/api/invitations.ts`

### Auth (frozen)
- `src/context/AuthContext.tsx`
- `src/auth/fetchAppUserProfile.ts`
- `src/lib/supabase.ts`

---

## Commit Convention (from Phase 8 onward)

- Commit initial phase implementation immediately after validation
- Each subsequent refinement or fix gets its own separate commit before moving on

```
type(scope): short description

Phase N: Label

- Bullet one
- Bullet two

Refs #issue-number
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`

Do not include commit messages in builder prompts — commits are handled by christian separately.

---

## Review Convention

When christian sends builder output for review, the minimum package is:
- `git diff` — always required
- Screenshot — only when visual feedback is needed
- A note from christian — only if something felt wrong during testing

Builder findings report, `git status`, and `tsc` output are not required.

---

## Builder Prompt Convention

Always instruct the builder to:
- Read canonical docs before doing anything
- Investigate codebase first and report findings before implementing
- Never use local state workarounds to simulate server-side functionality
- Run `npx tsc --noEmit` after changes
- Update `docs/plans/UI_OVERHAUL.md` to reflect completion using established documentation conventions
- Report findings before making any changes when diagnosing issues
- Include what to expect when testing and what should not change in every phase prompt
- Follow documentation conventions established in `docs/plans/UI_OVERHAUL.md`
- Do not include commit messages in builder prompts

External factors (Supabase SQL, RLS policies, database queries, RPCs) are handled by christian directly — not the builder.

---

## Next Steps

1. Begin Phase 9 using the prompt produced at the end of this session
2. Review Phase 9 diff and validate before committing
3. Proceed to Phase 10 (validation and merge)
4. After overhaul is merged to `dev`: investigate #7 (Unknown Author RLS), #8 (allow_download schema), #5 (Browse category UUIDs), and #6 (list/tile toggle)

---

## Intended Branch Workflow

```
feat/ui-overhaul → dev → main
```

`main` is not to be touched until UI overhaul is complete and merged to `dev`.