# 0048: Pending Members, Role Assignment, and Modular Permissions

Date: 2026-07-16

Status: Accepted

## Problem

Every join path (invite code, invite link, an approved join-request)
immediately granted a full "Member" role via one shared method,
`OrganizationsService.addMembership`. There was no notion of a member who
has joined a house but hasn't been assigned a role yet — new members saw
the full workspace instantly, with access controlled only by a coarse
Owner/non-Owner split (`requireOwnerRole`). The ask was a Discord-style
flow: joining creates membership immediately, but the member sees a
waiting screen and has zero access until an admin explicitly assigns
them a Position, a Team, and a set of modular permissions. This is
**Phase 1** of a phased Dashboard/onboarding rebuild (user-confirmed):
the access-control core. Dashboard visual extras (favorites, pins,
drag-reorder, archive, search, storage/activity badges, cross-house
notification aggregation, instant-switch with per-house last-page
memory) are explicitly deferred to a later phase.

## Decision

- **`OrganizationMembership.roleId` is now nullable.** `roleId: null` is
  the pending state. `addMembership` (the single choke point all three
  join paths already funneled through) creates the membership with
  `roleId: null` and skips seeding a `CrewProfile` (no Position/Team
  exists yet to seed one with).
- **One method centralizes the access gate.** All 18 domain services
  (tasks, chat, files, projects, crews, calendar, bookings, ...) already
  called `organizationsService.requireMembership()`. Changing what that
  method asserts — membership exists **and** `roleId` is non-null —
  blocks every one of those services for a pending member automatically,
  with zero changes needed in any of them. A new `requireAnyMembership`
  (pending-or-active) covers the few calls that must still work before a
  role exists: switching which house is active, and leaving a house.
- **`Role` gains a `permissions: String[]`** column — a flat, centralized
  permission list (18 keys: view/edit projects, create/delete tasks,
  view/upload/delete files, manage crew, invite/remove members, manage
  calendar/bookings/house-settings/roles/drive/storyboards/budget/
  clients, approve members) shared by everyone holding that named
  Position in the house — Discord-style role permissions, not
  per-membership overrides. A new `requirePermission(orgId, userId,
permission, action)` helper (Owner always passes) is the first
  consumer; other services keep their existing Owner-only/any-member
  gates unchanged this pass (see Future Implications).
- **"Team" reuses the existing `CrewProfile.department` column** (a
  plain string, already defaulting to `"Production"`) instead of adding
  a new field or model — the Assign Role wizard's Team step just sets
  it. The suggested department list (`DEPARTMENT_ORDER` in
  `crew-data.ts`) was extended with Creative/Marketing/Management to
  match the spec's suggestions; `Project.teamIds` is an unrelated field
  on a different model, not reused.
- **"Position" widens `RoleName`** from an 8-value union to `string` —
  `Role.name`/`CrewProfile.jobTitle` were already plain columns, so this
  is a type-only relaxation (verified no other file imports the
  `RoleName` type; hardcoded `role === "Owner"` checks keep working).
  `POSITION_SUGGESTIONS` (13 names) lives in the new
  `apps/web/src/lib/permissions.ts` alongside `PERMISSIONS`,
  `PERMISSION_LABELS`, and `PERMISSION_PRESETS` (Owner/Admin/Producer/
  Editor/Client/Custom) — one plain-data file, no new dependency,
  imported by both the server (default-role seeding, migration backfill)
  and the client (the Assign Role wizard).
- **Assign Role writes to a Role by name, not a new row per assignment.**
  Submitting the wizard finds-or-creates a `Role` `(organizationId,
name)` and **overwrites its `permissions`** with the submitted set —
  editing an existing Position's permissions affects everyone who holds
  it, matching the spec's own "Editor preset"/"Producer preset" language
  and standard Discord/most-systems role semantics.
- **Ban reuses the array-column pattern** already established by
  `Organization.enabledModules` — a new `bannedUserIds: String[]` blocks
  future joins by that user; Reject just deletes the pending membership
  row without banning.
- **Waiting screen, not a stripped-down app.** `AppShellGate` renders
  `WaitingForApprovalPage` (no sidebar/topbar) whenever the active
  house's `myRole` is `null`, for every route — a pending member cannot
  reach any workspace page by URL. The one exception is `/dashboard`
  itself, which must stay reachable as the house-switcher (its card grid
  shows a "Waiting for Approval" badge for the pending house instead of
  short-circuiting to the waiting screen) — otherwise a pending member
  would have no way back to a different house they already have access
  to, since the sidebar (and its logo-click-to-dashboard) isn't rendered
  for them at all.
- **No new realtime channel for the auto-transition.** The waiting
  screen self-polls `refreshWorkspace()` every 5 seconds (same interval-
  based pattern as the existing heartbeat in `app-shell-gate.tsx`); once
  `myRole` flips from `null` to a real value, `AppShellGate` re-renders
  into the normal shell automatically, and a one-time "Welcome to
  {house}!" toast fires from a ref-diffed effect. Consistent with this
  app's no-scheduled-job-infra constraint (ADR 0042).
- **House creation simplified to two steps** (Name → Tag), dropping the
  Description field from creation entirely (the DTO already had a
  server-side fallback description, so no backend change was needed).
  The Tag step live-checks availability via a new
  `GET /api/v1/houses/check-handle` route, debounced client-side with a
  plain `setTimeout` (no new hook/library). Handle validation tightened
  to lowercase letters + digits only, 3-20 characters, matching the
  spec's rule (existing hyphenated handles are grandfathered).

## Alternatives

- **A separate `Team`/`Department` model.** Rejected — `CrewProfile.
department` already models exactly this, and it's already a plain
  string column with no per-house configuration needed beyond the
  suggested-list UI.
- **Per-membership permission overrides** (a `permissions` array on
  `OrganizationMembership` instead of `Role`). Rejected — the spec's own
  language ("Editor preset", "Producer preset") describes permissions as
  a property of the Position, not the individual; per-membership
  overrides would also mean two people both holding "Editor" could
  silently drift to different permission sets, which is confusing and
  wasn't asked for.
- **Retrofitting every existing service's authorization** to consume
  `requirePermission` in this pass. Rejected as out of scope for Phase
  1 — the ask was specifically the pending-member/assign-role core;
  existing Owner-only gates (Modules toggle, Sensitive files, etc.) are
  unchanged and still correct, just not yet permission-driven.

## Tradeoffs

Benefits:

- Every existing domain service is correctly gated against pending
  members for free, because they all already funnel through the one
  `requireMembership` choke point — no risk of a forgotten endpoint
  leaking data to an unapproved member.
- The permission list is a single flat array (`PERMISSIONS` in
  `permissions.ts`) that future modules (Invoices, CRM, Equipment,
  Finance, Clients, AI, Asset Library) extend by adding keys — nothing
  about the gating mechanism needs to change when they do.

Costs:

- Only `approve_members` is actually consumed by `requirePermission` this
  pass; the other 17 permissions are stored and toggleable in the wizard
  but not yet enforced anywhere — they're forward-looking scaffolding for
  the next phase, not fully wired authorization yet.
- Editing a shared Position's permissions from the wizard changes access
  for everyone holding that Position in the house, not just the member
  being assigned — intentional (see Decision), but worth calling out
  since it's a different mental model than "per-person permissions."
- Verified the full flow (join → pending → waiting screen → gated
  everywhere → assign role → auto-transition) using a synthetic pending
  membership row inserted directly for a second test account, since
  driving two real concurrent logins wasn't available in this pass —
  the Assign Role/Reject/Ban actions and the resulting DB state
  (`role_id`, `permissions`, `department`, `banned_user_ids`) were all
  confirmed correct; the client-side auto-transition/toast use the same
  polling mechanism already proven live for the waiting screen itself.

## Future Implications

- Retrofit `requirePermission` into the other 17 domain services'
  existing gates once real usage shows which checks matter most (mirrors
  ADR 0046's deferred route-level module enforcement).
- Dashboard visual layer: favorites, pins, drag-reorder, archive, search,
  storage-usage/recent-activity badges, cross-house notification
  aggregation feed, and instant per-house last-page memory.
- QR-code join (explicitly marked "future" in the request itself).
