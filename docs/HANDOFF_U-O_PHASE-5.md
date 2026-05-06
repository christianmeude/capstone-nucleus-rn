# NUcleus Mobile — Session Handoff Context

## Project Overview

React Native Expo app (`capstone-nucleus-rn`) migrated from an Express backend to direct Supabase integration. Migration is complete and stable. UI overhaul is in progress on branch `feat/ui-overhaul`, Phases 1–5 complete, Phase 6 prompt ready.

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

Currently on branch `feat/ui-overhaul`, branched off `dev`.

- ✅ Phase 1 — Design system foundation
- ✅ Phase 2 — Component system
- ✅ Phase 3 — Dashboard overhaul
- ✅ Phase 4 — MyPapers overhaul
- ✅ Phase 5 — Browse overhaul
- ⏳ Phase 6 — Notifications (prompt ready, not started)
- ⏳ Phase 7 — Invitations (not started)
- ⏳ Phase 8 — ResearchDetail (not started)
- ⏳ Phase 9 — Polish and accessibility (not started)
- ⏳ Phase 10 — Validation and merge (not started)

---

## Critical Architectural Context

### Email-based RLS identity resolution
All mobile RLS policies resolve ownership via email:
```sql
user_id = (
  SELECT id FROM public.users
  WHERE email = auth.email()
)
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
- `statusToLabel()` in `src/utils/format.ts` is the canonical label source — `approved` maps to `"Approved"`, `published` maps to `"Published"`

---

## Resolved Issues

### Migration issues (all closed)
- ✅ Issue #1 — View/download counts not persisting (SECURITY DEFINER RPCs)
- ✅ Issue #2 — UUID mismatch RLS failures (email-based resolution)
- ✅ Issue #3 — Co-author invitation blank fields (get_user_basic_info RPC)

### UI overhaul issues
- ✅ Issue #4 — approved papers incorrectly labeled "Published" — fixed in `statusToLabel`, closed

## Open Issues
- 🔴 Issue #5 — Browse category filter shows unresolved UUIDs — backend investigation needed
- 🔴 Issue #6 — Browse toggleable list/tile view — deferred enhancement

---

## Current RLS Policy State (Supabase)

All policies use email-based resolution. See `docs/plans/SUPABASE_MIGRATION.md` for full SQL details.

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
- Fonts: Outfit (UI) + Lora (display/editorial) via `@expo-google-fonts`
- All token consumption via direct `import { theme } from '../theme'` — no `useTheme()` hook

### Component system
- `src/components/ui/` — Surface, Card, PressableCard, Button, Chip, Badge, Stat, IconButton, EmptyState, Skeleton, InlineNotice, BottomSheet, Divider, Logo, OrbitalAccent
- `src/components/` — ResearchCard, NotificationCard, InvitationCard, PaperStatusChip

### ResearchCard props (current state)
- `paper: ResearchPaper` — required
- `onPress?: () => void`
- `showEngagementCounts?: boolean` — default `false`; only Browse passes `true`
- `showStatusChip?: boolean` — default `true`; Browse passes `false`
- `keywords?: string[]` — renders muted gold tag chips, capped at 4, horizontal scroll
- `categoryLine?: string` — renders above title as small muted text when provided
- Author avatar: 32pt navy circle with white first initial
- Counts row: `eye-outline` icon for views, `download-outline` for downloads
- Shadow: `theme.shadows.level2` on all card variants

### PaperStatusChip exports
- `ACTIVE_STATUSES` — pending variants
- `ACTION_STATUSES` — revision_required, rejected
- `PUBLISHED_STATUSES` — approved, published
- Tone mapping: approved/published → success (green), revision_required → warning (orange), rejected → danger (red)

### Screen-level prop conventions
- Dashboard — `paper` + `onPress` only; no counts, no keywords, status chip visible
- MyPapers — `paper` + `onPress` only; no counts, no keywords, status chip visible
- Browse — `showEngagementCounts={true}`, `showStatusChip={false}`, `keywords={paper.keywords ?? undefined}`, `categoryLine` when resolved

### Active Supabase facades (frozen)
- `src/api/research.ts`
- `src/api/notifications.ts`
- `src/api/invitations.ts`

### Auth (frozen)
- `src/context/AuthContext.tsx`
- `src/auth/fetchAppUserProfile.ts`
- `src/lib/supabase.ts`

### Assets
- `assets/images/` — logo image file added but not yet wired into `Logo` component. Wire up when ready by updating `src/components/ui/Logo.tsx` to use `require('../../assets/images/nucleus-logo.png')` via RN `Image`.

---

## Commit History (most recent first)

```
582aa2d (HEAD -> feat/ui-overhaul) feat(components): polish ResearchCard and Browse
3748ae1 feat(components): overhaul ResearchCard with avatar, keywords, and icon counts
e5dd4ab feat(browse): overhaul Browse screen to design system
9c257cf fix(components): correct status labels and count visibility scoping
3c53aa0 fix(components): correct status labels, colors, and count visibility
a1a7343 feat(my-papers): overhaul MyPapers screen to design system
6323bbe feat(dashboard): overhaul Dashboard screen to design system
cb8cf47 feat(components): build component system and themed navigator
86e2b6c feat(theme): establish design system foundation
19c14ed docs: add UI overhaul implementation plan
2b3f3a7 (dev) Merge branch 'feat/supabase-migration' into dev
c1c03cc (origin/main, origin/dev, origin/HEAD, main) docs: add project context and migration plan
8b31f1c feat: initial React Native implementation
```

---

## Current Git State

Branch: `feat/ui-overhaul` — 9 commits ahead of `dev`, nothing uncommitted.

**Untracked:** `assets/images/` — logo file, not yet staged or committed. Stage when `Logo` component is updated to use it.

**Intended branch workflow:**
```
feat/ui-overhaul → dev → main
```
`main` is not to be touched until UI overhaul is complete and merged to `dev`.

---

## Next Steps

1. Begin Phase 6 — Notifications overhaul using the approved prompt
2. Continue Phases 7–10 per `docs/plans/UI_OVERHAUL.md`
3. Wire logo image into `Logo` component when ready — `assets/images/` is already in place
4. Investigate Issue #5 (category data) after UI overhaul is complete
5. Implement Issue #6 (list/tile toggle) as a post-overhaul enhancement

---

## Deferred Items (tracked as issues)

- Issue #5 — Category UUID resolution failure in Browse — backend investigation needed post-overhaul
- Issue #6 — List/tile toggle for Browse — enhancement, post-overhaul

---

## Documentation Conventions

All implementation plan updates must follow the format established in `docs/plans/SUPABASE_MIGRATION.md`:
- Phase status: `✅ **COMPLETED (stable)**` or `⏳ **NOT STARTED**`
- Completed task bullets: `- ✅`
- Pending task bullets: `- ⏳`
- Past tense implementation summaries under `**Implementation summary**`
- `**Exit criteria met:**` when phase is complete
- No excessive nesting, no bold on every line

---

## Commit Conventions

```
type(scope): short description

Phase N: Label

- Bullet one
- Bullet two

Refs #issue-number
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`

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
- Do not include commit messages in builder prompts — commits are handled separately

External factors (Supabase SQL, RLS policies, database queries, RPCs) are handled by the human directly — not the builder.