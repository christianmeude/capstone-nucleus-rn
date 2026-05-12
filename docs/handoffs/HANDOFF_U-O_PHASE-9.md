# NUcleus Mobile — Session Handoff Context

## Project Overview

React Native Expo app (`capstone-nucleus-rn`) migrated from Express backend to direct Supabase integration. Migration complete and stable. UI overhaul on branch `feat/ui-overhaul`, Phases 1–9 complete, Phase 10 (validation + merge) ready to run.

**Canonical docs in the repo:**
- `docs/PROJECT_CONTEXT.md` — product identity, audience, navigation, domain types, principles
- `docs/PRODUCT_ROADMAP.md` — UX and design direction reference
- `docs/plans/SUPABASE_MIGRATION.md` — completed migration history, marked `[COMPLETED]`
- `docs/plans/UI_OVERHAUL.md` — active implementation plan, currently `[IN PROGRESS]` until Phase 10 lands
- `docs/handoffs/HANDOFF_U-O_PHASE-8.md` — prior session baseline (still useful for Phase 8 context)

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
- ✅ Phase 9 — Polish and accessibility (initial pass + refinement pass both committed)
- ⏳ Phase 10 — Validation and merge (smoke-test-only; no new code)

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
- `statusToLabel()` in `src/utils/format.ts` is the canonical label source; `STATUS_LABELS` now includes `accepted`, `declined`, `expired` for invitation contexts
- Notification domain type field is `is_read` (not `read`) — confirmed from source
- `CoAuthorInvitation.created_at` is `string | undefined` — guard before rendering

### Android edge-to-edge constraint
`app.json` sets `android.edgeToEdgeEnabled: true`. In edge-to-edge mode the system status bar is permanently translucent — typed `Stack.Screen` `statusBar*` options on `@react-navigation/native-stack` did not produce a clean fix for the top-inset overlap on `ResearchDetail`. The repo solves this with a **custom screen-scoped stack header**, not a navigator-wide wrap. See `Current State of the Codebase` below.

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
- 🔴 #8 — Download button always visible — no `allow_download` column on `research_papers` (bug). **Mitigated in mobile UI in Phase 9 refinement**: Download button hidden, UI `trackDownload` call-site removed; backend column still pending. Commit references `Refs #8`.

**Do not invent issue numbers beyond #8.**

---

## Current RLS Policy State

All policies use email-based resolution. See `docs/plans/SUPABASE_MIGRATION.md` for full SQL.

**Affected tables:** `notifications`, `co_author_invitations`, `research_papers`, `paper_views`, `paper_downloads`, `public.users`

---

## Supabase RPCs

- `increment_view_count(row_id uuid)` — SECURITY DEFINER
- `increment_download_count(row_id uuid)` — SECURITY DEFINER (still exists; just not called from mobile pending #8)
- `get_user_basic_info(user_id uuid)` — SECURITY DEFINER, returns basic profile without triggering RLS recursion

---

## Current State of the Codebase

### Design system
- `src/theme/` — `colors`, `typography`, `spacing`, `shadows`, `radii`, `motion`, `index`
- Fonts: Outfit (UI) + Lora (display/editorial — paper title in `ResearchDetail` only)
- All token consumption via direct `import { theme } from '../theme'` — no `useTheme()` hook

**Theme additions in Phase 9:**
- `src/theme/motion.ts` exports `motion = { skeletonCycleDuration: 900, listItemDuration: 320, listStaggerDelay: 60 }` (ms). Exposed via `theme.motion`. All Phase 9 animation durations source from here — no inline literals.
- `src/theme/typography.ts` applies `scaledFontSize` (PixelRatio-aware, cap **1.3x**) to every `fontSize` passed through `make()`. Line heights remain fixed numbers so they don't compound.
- `src/theme/colors.ts` contrast adjustments: `state.success` **#059669 → #047857**; `state.danger` **#DC2626 → #B91C1C**. Other audited pairings already passed WCAG AA.

### Hooks
- `src/hooks/useReduceMotion.ts` — single source of truth for the platform reduce-motion setting (subscribes via `AccessibilityInfo`). Used by `Skeleton.tsx` and `ListEntranceItem.tsx`. **Do not call `AccessibilityInfo.isReduceMotionEnabled()` directly anywhere else in the codebase.**

### Component system
- `src/components/ui/` — Surface, Card, PressableCard, Button, Chip, Badge, Stat, IconButton, EmptyState, Skeleton (animated, reduce-motion-aware), InlineNotice, BottomSheet, Divider, Logo, OrbitalAccent
- `src/components/` — ResearchCard, NotificationCard, InvitationCard, PaperStatusChip, **ListEntranceItem** (new in Phase 9)

### Navigation
- `src/navigation/AppNavigator.tsx` — bottom tabs + stack; **wires a custom screen-scoped header for `ResearchDetail` only** (does not wrap the whole `Stack.Navigator` in a top-edge `SafeAreaView`, which causes empty bands on headerless screens)
- `src/navigation/ResearchDetailHeader.tsx` (new in Phase 9 — §9.0 fix) — custom header using `useSafeAreaInsets().top` to clear the status bar under Android edge-to-edge. Renders the title plus the system back affordance. Pattern of last resort: typed `Stack.Screen` options were not sufficient under edge-to-edge.

### Key component details

**ListEntranceItem (new):**
- Wraps each list item on Dashboard recents, MyPapers, Browse, Notifications, Invitations
- Staggered fade + 8px upward translate using RN core `Animated.parallel` inside `Animated.sequence` with `Animated.delay`
- Easing: `Easing.out(Easing.cubic)`
- Durations: `theme.motion.listItemDuration` (320ms) and `theme.motion.listStaggerDelay` (60ms)
- Reduce-motion → instant render at full opacity, no transform
- Exposes `useListEntranceActive` (React Context) so children can branch styles during the entrance; `false` once the entrance completes
- **Not applied** to `ResearchDetail` (it is not a list)

**ResearchCard props (unchanged shape, behavior refined):**
- `paper`, `onPress` — always
- `showEngagementCounts` — default `false`, Browse passes `true`
- `showStatusChip` — default `true`, Browse passes `false`
- `keywords` — Browse only, capped at 4
- `categoryLine` — Browse only, renders above title as muted small text
- **Phase 9 refinement:** reads `useListEntranceActive`; while entering, applies `theme.shadows.level0` to suppress Android `elevation` ghost; restores `theme.shadows.level2` after entrance completes. Static post-entrance shadow is unchanged.

**InvitationCard props:** unchanged from Phase 8 baseline.

**NotificationCard:** unchanged from Phase 8 baseline; entrance never produced a shadow ghost because it relies on tint, not elevation.

**PaperStatusChip exports:**
- `ACTIVE_STATUSES`, `ACTION_STATUSES`, `PUBLISHED_STATUSES`
- Tone mapping: approved/published → success (green), revision_required → warning (orange), rejected → danger (red), pending variants → info (blue)
- **No longer rendered on `ResearchDetail` chrome** (Phase 9 refinement). Still used by `ResearchCard`.

**Skeleton:**
- Props: `height`, `width`, `radius`
- **Phase 9:** animated opacity pulse `0.4 ↔ 1.0` over `theme.motion.skeletonCycleDuration` via `Animated.loop` + `Animated.sequence`; static `opacity: 0.6` under reduce motion

**EmptyState:** unchanged.

**InlineNotice:** unchanged.

**Button:** unchanged.

### Screen conventions
| Screen | engagementCounts | keywords | statusChip |
|---|---|---|---|
| Dashboard | ❌ | ❌ | ✅ |
| MyPapers | ❌ | ❌ | ✅ |
| Browse | ✅ | ✅ | ❌ |

### ResearchDetailScreen specifics (Phase 9 refinement)
- `SafeAreaView` with `edges={['bottom']}` wrapping `ScrollView` — kept from Phase 8 d4023c3; insets the body for the tab bar / home indicator
- Stack header is the custom `ResearchDetailHeader` wired in `AppNavigator.tsx` — clears the status bar on Android edge-to-edge
- Title in Lora `display` scale — only Lora usage in the entire app
- `useAuth()` imported for `isOwner` check via `structured_authors`
- Workflow hidden for `approved`/`published` papers unless signed-in user is primary author
- **No `PaperStatusChip` in chrome** — status is communicated by Workflow History when present, or by the absence-as-signal for public approved/published papers
- **No `Download` button** — Issue #8; `Open PDF` is the sole action. `openFile` no longer takes a `trackDownload` parameter; view tracking is preserved. Source has a one-line comment near `Open PDF` noting the temporary hiding pending `allow_download`
- **Compact metadata strip** replacing the prior stacked rows:
  - Top row: author avatar pill (matches `ResearchCard` 32×32 pattern) + bold author name on the left; engagement stats (`eye-outline` + view count, `download-outline` + download count) on the right with `accessibilityLabel`s like `"5 views"`
  - Second row: `calendar-outline` + relative date (`formatRelativeTime`); `accessibilityLabel` carries the absolute date (`formatDate`) for screen readers
  - Department: small pill below the title, only when `paper.department` is present
  - Co-authors: hidden entirely when `listCoAuthorNames(paper) === 'None'`; otherwise a `+N co-authors` `Pressable` chip with `accessibilityRole="button"` and `accessibilityState={{ expanded }}` that toggles a names list inline
- `listCoAuthorNames` helper added to `src/utils/format.ts` in Phase 8 — still in use

### Active Supabase facades (frozen)
- `src/api/research.ts` (still contains `trackDownload`; UI call-site removed but facade preserved for when `allow_download` ships)
- `src/api/notifications.ts`
- `src/api/invitations.ts`

### Auth (frozen)
- `src/context/AuthContext.tsx`
- `src/auth/fetchAppUserProfile.ts`
- `src/lib/supabase.ts`

---

## Phase 9 architectural decisions to preserve

1. **`react-native-reanimated` stays out of `feat/ui-overhaul`.** All Phase 9 motion is implemented on RN core `Animated`. The original plan (`UI_OVERHAUL.md` §2.3 / §7) documents Reanimated as a scoped exception that may be revisited. The decision in this overhaul: **do not retrofit Phase 9 to Reanimated**. Reanimated will be introduced as the explicit Phase 1 foundation of the next branch `feat/reading-experience` (see Next Steps).
2. **Custom `ResearchDetailHeader` is the established pattern** for any stack screen needing reliable top-inset under Android edge-to-edge. Do not introduce a top-edge `SafeAreaView` around the entire `Stack.Navigator` — it pads headerless screens too and creates visual artifacts.
3. **`useReduceMotion` is the single source of truth.** All future motion work — including in `feat/reading-experience` under Reanimated — must consume this hook, not call `AccessibilityInfo` directly.
4. **`theme.motion` is the single source for animation durations.** No inline numeric literals for durations in components.
5. **`PaperStatusChip` lives in `ResearchCard` only.** Detail-screen chrome no longer uses it; do not reintroduce in reader-mode rework without an explicit product decision.
6. **`scaledFontSize` is module-load-time** by design (startup cap, not reactive per-render). If a future need arises for per-render reactive scaling, add a separate hook rather than reworking `typography.ts`.

---

## Commit Convention (unchanged from Phase 8)

- Commit initial phase implementation immediately after validation
- Each subsequent refinement or fix gets its own separate commit before moving on, **except where explicitly overridden by christian for a single delivery** (Phase 9 refinements were bundled into one commit as an explicit one-time override)
- Reference relevant issue numbers in the commit body footer

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
- Read canonical docs before doing anything (`UI_OVERHAUL.md`, the latest handoff)
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

1. **Phase 10 — Validation.** Run the unfiled Phase 10 builder prompt (smoke-test checklist only — no new code). Builder produces a findings/checklist report against the 11-item smoke test already in `UI_OVERHAUL.md` §Phase 10.
2. **Manual smoke test on device** for each of the 11 items.
3. **Flip `docs/plans/UI_OVERHAUL.md` top-line header** from `# [IN PROGRESS]` to `# [COMPLETED]`.
4. **Merge `feat/ui-overhaul → dev`.** Optional tag (e.g. `v0.9-ui-overhaul`) as a clean capstone milestone.
5. **Open `feat/reading-experience` off `dev`.**
6. **Author `docs/plans/READING_EXPERIENCE.md`** mirroring the `UI_OVERHAUL.md` structure (header `[NOT STARTED]`, §1 Constraints, §2 Design references, §3 System map if needed, §4 Phases, §5 final Validation/Merge phase, §6 Validation strategy, §7 Non-goals, §8 File-by-file effect matrix). First phase = **Foundations: install Reanimated, wire `react-native-reanimated/plugin` last in `babel.config.js`, smoke-test under `newArchEnabled: true`**. Subsequent phases cover the reader/author mode split, in-app PDF viewer + watermark, and scroll-driven `ResearchDetail` (hero collapse, sticky compact title, parallax, read-progress bar).
7. **After overhaul + reading-experience merged to `dev`:** investigate #7 (Unknown Author RLS), #8 (allow_download schema + reintroduce Download UI), #5 (Browse category UUIDs), #6 (list/tile toggle).

---

## Intended Branch Workflow

```
feat/ui-overhaul → dev → main
feat/reading-experience → dev → main   (next branch, opened off dev after overhaul merges)
```

`main` is not touched until both efforts merge to `dev` and pass a `dev`-level smoke pass.