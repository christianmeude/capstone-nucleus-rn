# NUcleus Mobile — Project Context

This document is the canonical product and system overview for the NUcleus Mobile application. It presents the product purpose, audience, core features, typical user flows, minimal architecture, navigation model, and domain expectations used for onboarding engineers and guiding product decisions.

## Purpose

NUcleus Mobile is a focused research reader and student workspace for enrolled students at National University — Dasmariñas. The app helps students discover, read, and monitor the status of research outputs relevant to their studies.

Core user value:
- Fast, reliable access to published research and personal paper status.
- A simple reading experience for PDFs and paper metadata.
- A personal view of the student’s papers, invitations, and notifications.

## Audience

- Primary: enrolled students (role: `student`).
- Non-students (faculty, staff, admin) are not the intended audience; the app surfaces a limited/unsupported experience for them.

## In-scope (What the app provides)

- Student authentication and session persistence.
- Browse published research with search and category filters.
- Research detail views showing metadata, available workflow notes, and file access.
- My Papers: a list and filters scoped to the signed-in student’s papers.
- Dashboard: personal summary and lightweight analytics derived from the student’s papers.
- Notifications: listing, unread indicators, and mark-as-read behavior.
- Co-author invitations: view, accept, and decline.

## Out-of-scope (What the app does NOT provide)

- Research submission or editorial workflows (no create/update/delete for submissions).
- Faculty, admin, or staff dashboards and management features.
- Draft creation, editorial collaboration, or other authoring tools.

These exclusions keep the mobile product focused and safe for student use.

## High-level user flows

- Login → Dashboard
    - Student signs in or restores a session and lands on a personal Dashboard summarizing recent activity.

- Browse → Research Detail → Open PDF
    - Student discovers papers, opens a detail view for metadata and workflow context, then opens the PDF in-app or via an external viewer where permitted.

- My Papers / Dashboard
    - Student inspects their own papers, views workflow status and recent changes; Dashboard provides quick counts and recents for fast insight.

- Notifications / Invitations
    - Notifications present recent updates; students can mark items read or open related content. Invitations list shows co-author invitations with accept/decline actions and updated state.

These flows define the UX contract and are intentionally implementation-agnostic.

## Minimal system architecture (conceptual)

- Mobile App → Supabase (Authentication, Database, Storage)
- Web Backend → Admin / provisioning (separate from mobile runtime data flow)

Notes:
- The mobile client relies on a hosted platform (Supabase) for authentication, data, and file storage. The web backend is responsible for administrative and provisioning workflows and is not part of the mobile runtime data path. This section remains conceptual and does not prescribe implementation details.

## Navigation model

- Root stack:
    - `Login` — authentication screen
    - `UnsupportedRole` — shown to non-students
    - `StudentTabs` — bottom tabs for authenticated students
- Student tabs:
    - `Dashboard`
    - `MyPapers`
    - `Browse`
    - `Notifications`
    - `Invitations`
- Additional stack screens:
    - `ResearchDetail` — full paper details and file access

Consult routing and gating in `src/navigation/AppNavigator.tsx` and `src/navigation/types.ts` when implementing behavior.

## Data and domain expectations

- Core domain types are defined in `src/types/domain.ts` and should be treated as the canonical shapes for the app’s UI and facades.
- Typical entities:
    - Research paper: title, abstract, authors, status, file reference
    - User profile: identity fields, display name, role
    - Notification: id, title, body, timestamp, read state
    - Invitation: id, paper reference, inviter, status

Design guidance: map backend rows to these shapes without renaming fields unnecessarily.

## Access control & role model

- Authoritative user profile: the application relies on a canonical user profile record as the authoritative user identity (for example, the `public.users` profile used by backend services). A valid, complete application profile is REQUIRED for an authenticated mobile session; users without a complete profile are not considered provisioned for the student product.
- Role model: only users with the `student` role may access the student product experience. Non-student roles are presented with the `UnsupportedRole` flow and do not gain access to student tabs or data-scoped screens.
- Ownership: personal data and views (for example `My Papers`, Dashboard summaries) are scoped to the signed-in student unless explicitly documented as shared or global.

## Key source areas for onboarding

- App entry: `App.tsx`, `index.ts`
- Auth surface: `src/context/AuthContext.tsx`
- Navigation: `src/navigation/AppNavigator.tsx`, `src/navigation/types.ts`
- Domain types: `src/types/domain.ts`
- High-level API facades: `src/api/*` (these are evolving and serve as the integration layer to backend services)

## Environment and configuration (conceptual)

- The app requires runtime configuration for authentication, data, and storage endpoints. Provide these via environment variables or build-time configuration and avoid committing secrets.

## How to use this document

- Use this file as the product-level source of truth for scope, UX contracts, and onboarding.
- For implementation details or migration history, consult service-specific docs or the codebase; this document intentionally avoids step-by-step migration instructions.

## Principles

- Student-only product experience: only users with the `student` role are permitted into the student product experience; non-student roles must be redirected to the `UnsupportedRole` flow.
- Read-first product: the mobile app is read-focused and provides no submission or content-creation capabilities.
- Preserve navigation and UX contracts; avoid breaking changes unless required by product decisions.
- Keep client responsibilities lightweight; prefer server-side operations for heavy or administrative tasks.

---

This document is intended to remain a stable reference for product, design, and engineering discussions about NUcleus Mobile.
