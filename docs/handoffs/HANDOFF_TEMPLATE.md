# NUcleus Mobile — Session Handoff Context

## Project Overview

React Native Expo app (`capstone-nucleus-rn`) [current architecture state in one sentence]. [Current undertaking] is in progress on branch `[feature-branch]`, [completed milestone range], [next milestone state].

**Canonical docs in the repo:**
- `docs/PROJECT_CONTEXT.md` — product identity, audience, navigation, domain types, principles
- `docs/PRODUCT_ROADMAP.md` — UX and design direction reference
- `docs/plans/SUPABASE_MIGRATION.md` — migration history and SQL/RLS policy reference
- `docs/plans/UI_OVERHAUL.md` — active implementation plan (or latest UI execution baseline)

**GitHub repo:** `christianmeude/capstone-nucleus-rn`

---

## [Undertaking A] Status

[Status line: complete/in progress/blocked]. [One-line confidence or stability statement]. See `[relevant-plan-doc]`.

---

## [Undertaking B] Status

Currently on branch `[feature-branch]`, branched off `[base-branch]`.

- ✅ Phase 1 — [Label]
- ✅ Phase 2 — [Label]
- ✅ Phase 3 — [Label]
- ⏳ Phase 4 — [Label]
- ⏳ Phase 5 — [Label]
- ⏳ Phase 6 — [Label]

If not phase-based, keep the same completed/pending format and replace "Phase N" with milestone labels.

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
- `[Profile resolution helper]` resolves by `auth.email()` against `public.users.email`

### users RLS recursion constraint
- `public.users` SELECT policy cannot reference itself — causes infinite recursion error `42P17`
- Cross-user profile reads go through `[security definer RPC name]` SECURITY DEFINER RPC

### Domain type notes
- `public.users` has no `auth_id` column — email is the only bridge
- `User.fullName` is the only name field — first name derived via `user.fullName.trim().split(/\s+/)[0]`
- `PaperStatus` includes both `approved` and `published` as distinct values
- `statusToLabel()` in `src/utils/format.ts` is the canonical label source — `approved` maps to `"Approved"`, `published` maps to `"Published"`

---

## Resolved Issues

### [Undertaking A] issues ([state, e.g., all closed])
- ✅ Issue #[number] — [problem summary] ([resolution mechanism])
- ✅ Issue #[number] — [problem summary] ([resolution mechanism])

### [Undertaking B] issues
- ✅ Issue #[number] — [problem summary] — [fix summary], closed

## Open Issues
- 🔴 Issue #[number] — [description] — [owner / dependency / investigation note]
- 🔴 Issue #[number] — [description] — [owner / dependency / investigation note]

---

## Current RLS Policy State (Supabase)

All policies use email-based resolution. See `docs/plans/SUPABASE_MIGRATION.md` for full SQL details.

**Affected tables:** `[table_1]`, `[table_2]`, `[table_3]`, `[table_4]`, `[table_5]`, `public.users`

---

## Supabase RPCs

- `[rpc_1(signature)]` — SECURITY DEFINER
- `[rpc_2(signature)]` — SECURITY DEFINER
- `[rpc_3(signature)]` — SECURITY DEFINER, [purpose detail]

---

## Current State of the Codebase

### Design system
- `src/theme/` — [tokens list / usage notes]
- Fonts: [font stack]
- All token consumption via direct `import { theme } from '../theme'` — no `useTheme()` hook

### Component system
- `src/components/ui/` — [UI primitives list]
- `src/components/` — [feature components list]

### [High-impact component] props (current state)
- `[prop signature]` — [default/usage]
- `[prop signature]` — [default/usage]
- `[visual/behavior note]`

### [Related component/module] exports
- `[export_1]` — [meaning]
- `[export_2]` — [meaning]
- `[mapping note]`

### Screen-level prop conventions
- `[Screen A]` — [prop usage convention]
- `[Screen B]` — [prop usage convention]
- `[Screen C]` — [prop usage convention]

### Active Supabase facades (frozen)
- `src/api/research.ts`
- `src/api/notifications.ts`
- `src/api/invitations.ts`

### Auth (frozen)
- `src/context/AuthContext.tsx`
- `src/auth/fetchAppUserProfile.ts`
- `src/lib/supabase.ts`

### Assets
- `[assets/path]` — [asset state and wiring note]

---

## Commit History (most recent first)

```text
[latest-sha] (HEAD -> [feature-branch]) [message]
[sha] [message]
[sha] ([base-branch]) [message]
[sha] ([origin/main refs], main) [message]
```

---

## Current Git State

Branch: `[feature-branch]` — [ahead/behind summary], [working tree status].

**Untracked:** `[path-or-none]` — [note]

**Intended branch workflow:**
```text
[feature-branch] → [integration-branch] → main
```
`main` is not to be touched until [active undertaking] is complete and merged to `[integration-branch]`.

---

## Next Steps

1. Begin [next phase/milestone] — [short action cue]
2. Continue [remaining phases/milestones] per `[active-plan-doc]`
3. [Integration or asset follow-up step]
4. Investigate Issue #[number] ([topic]) after [dependency]
5. Implement Issue #[number] ([enhancement]) as a post-[undertaking] item

---

## Deferred Items (tracked as issues)

- Issue #[number] — [deferred item] — [timing/dependency]
- Issue #[number] — [deferred item] — [timing/dependency]

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

```text
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
- Update `[active-plan-doc]` to reflect completion using established documentation conventions
- Report findings before making any changes when diagnosing issues
- Include what to expect when testing and what should not change in every phase prompt
- Follow documentation conventions established in `[active-plan-doc]`
- Do not include commit messages in builder prompts — commits are handled separately

External factors (Supabase SQL, RLS policies, database queries, RPCs) are handled by the human directly — not the builder.
