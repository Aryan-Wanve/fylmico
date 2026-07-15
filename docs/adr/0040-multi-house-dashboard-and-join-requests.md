# 0040: Multi-House Dashboard and Tag-Based Join Requests with Owner Approval

Date: 2026-07-14

Status: Accepted

## Problem

The only way to join a house was `joinHouse` by exact invite code (ADR
0020/0036) - membership was granted immediately, with no review step, and
a user had to already have the code in hand (shared out-of-band). There
was also no way to discover a house other than being told its code or
following an emailed `HouseInvitation` link; a user who only knew a house's
public handle (its "tag", e.g. `nova-frame`) had no path to request access.
Separately, `houses/new` was a one-shot onboarding page (create-or-join,
then redirect into the app) with no way to come back to it later and
switch between houses a user already belonged to, or review pending
requests.

## Decision

Add a `HouseJoinRequest` model plus a tag-based "request to join" flow
gated on Owner approval, and a new `/dashboard` hub page that replaces
`houses/new` as the destination whenever a user has no active house.

- **New `HouseJoinRequest` model** (`organizationId`, `userId`, `status`
  defaulting to `"pending"`, `respondedById`, `respondedAt`), unique on
  `(organizationId, userId)` - a user can have at most one request per
  house, re-requesting after a rejection flips the same row back to
  `pending` (`respondedById`/`respondedAt` cleared) rather than creating a
  duplicate row. Migration `20260714150000_house_join_requests` adds the
  table with RLS enabled and no policies, matching every other table in
  the schema.
- **Discovery is by handle, not invite code.** `requestToJoinHouse`
  (`RequestJoinHouseDto`, a single trimmed `handle` string) looks up the
  organization by its public `handle` field - the same handle already
  shown in the house's URL/profile - rather than requiring the unguessable
  `inviteCode`. This is deliberately more discoverable/lower-friction than
  the exact-code requirement: a handle is meant to be public and
  memorable, whereas `inviteCode` is meant to be shared deliberately one
  person at a time.
- **That openness needs a gate, so approval isn't automatic.** Because
  finding a house by handle is easy (arguably guessable, unlike a random
  invite code), `requestToJoinHouse` only creates a pending row and
  notifies owners - it does not call `addMembership`. Membership is only
  granted via `respondToJoinRequest(organizationId, userId, requestId,
status)`, which requires the Owner role (`requireOwnerRole`) and, on
  `"approved"`, calls the same shared `addMembership` helper `joinHouse`/
  `acceptInvitation` already use (role assignment, crew profile seed,
  `activeOrganizationId`, owner notification). On `"rejected"`, only the
  request row is updated and the requester is notified - no membership
  side effects.
- **Both notification channels fire on request creation.** `notifyOwners`
  (in-app notification, ADR 0023) and `emailOwners` (via
  `buildJoinRequestEmail`, reusing the mailer added in ADR 0019/0039) both
  run for every Owner of the target house when a request comes in, so an
  Owner learns about it whether or not they're actively watching the app.
- **Invite-code joining is untouched and still coexists.** `joinHouse` (by
  `inviteCode`) and `HouseInvitation` (targeted email links, ADR 0036) are
  unchanged - tag-based join-requests are a third path onto the same
  underlying `addMembership`, not a replacement for either. A house still
  has exactly one invite code and can still send targeted email
  invitations; the new path only adds "let someone find you by handle and
  ask."
- **`activateHouse(userId, organizationId)`** is a new, narrow endpoint
  (`requireMembership` then `setActiveOrganization`) - switching which
  house is "active" for a user who already belongs to several, without
  going through `joinHouse`/`createHouse`. This is what the dashboard's
  house cards call when a user clicks an existing house tile.
- **`/dashboard` replaces `houses/new` as the "no active house" landing
  page.** `HousesDashboardPage` lists every house the user belongs to as a
  clickable card (via `workspace.houses`, from `getHousesForUser`), plus
  the existing `HouseChoiceCard` (now with a third "Request to join by
  tag" mode alongside "Create" and "Join by code") for creating, joining,
  or requesting. House cards owned by the current user (role `"Owner"`)
  get a "Join requests" button opening `JoinRequestsDialog`, which lists
  pending requests for that house (`GET .../join-requests`) and lets the
  Owner approve/reject inline (`Check`/`X` buttons calling
  `respondToJoinRequest`, removing the row from the list on success).
  `AppShellGate` now redirects to `/dashboard` (not `/houses/new`)
  whenever `activeHouse` is falsy, and `getSafeRedirect`'s fallback
  target (when no `redirectTo` query param is present, or it doesn't match
  the invite/join allow-list) changed from `/home` (implicitly, via the
  old onboarding) to `/dashboard`. The old `houses/new/page.tsx` and
  `no-house-onboarding.tsx` were deleted outright rather than kept
  alongside the new page - the dashboard is a strict superset of what
  onboarding did (create/join/request, now also listing existing houses
  and switching between them).

## Alternatives

- **Auto-approve tag-based requests, same as invite-code joining.**
  Rejected: the entire reason a handle is easier to discover than an
  invite code is that it's meant to be public - auto-granting membership
  to anyone who guesses or is told a handle would make the invite-code
  system's deliberate friction pointless for houses that also expose a
  discoverable tag.
- **Let any existing member (not just Owners) approve/reject join
  requests**, mirroring how any member can technically see the invite
  code. Rejected: approving membership is a higher-stakes action than
  sharing a code that's already meant to be shared - kept it on the same
  Owner-only bar as `removeMember`/invitation management from ADR 0036.
- **Replace `houses/new` in place rather than introducing `/dashboard` as
  a new route.** Rejected: `houses/new` implied "you're new here,"
  whereas the new page is also the multi-house switcher a long-time user
  returns to - a distinct route name matches the distinct, broader
  purpose and avoids overloading a URL that used to only make sense
  pre-membership.

## Tradeoffs

Benefits:

- A house can now be found and requested by its public handle without
  needing an invite code in hand, while still requiring explicit Owner
  sign-off before membership is granted - discoverability without giving
  up access control.
- Users who belong to (or are invited into) multiple houses have a single
  place to see and switch between them, instead of only ever landing in
  whichever house happened to be active.
- Re-requesting after rejection reuses the same row (unique constraint),
  so there's no unbounded growth of stale rejected-request rows per
  user/house pair.

Costs:

- Owners now have one more inbox to check (join requests) alongside
  invitations and notifications - nothing currently surfaces a pending-
  request count as a badge outside the dashboard's per-house button.
- A rejected requester isn't blocked from ever requesting again (the row
  just flips back to pending), so a determined requester can re-request
  indefinitely; there's no cooldown or rejection-count cap yet.
- Two separate join surfaces (`HouseChoiceCard`'s "Join by code" and
  "Request to join by tag" modes) sit side by side in the UI - a new user
  has to understand the difference between "I have a code" and "I know a
  tag," which is a small but real cognitive load increase over the single
  prior "Join a house" flow.

## Future Implications

- If per-role invitations or request-time role selection become a need
  (e.g. "I want to join specifically as a Videographer"), `RequestJoinHouseDto`
  and `HouseJoinRequest` would need a `roleId` column - additive, same
  shape as the note already left in ADR 0036 for `HouseInvitation`.
- A pending-request count badge on the dashboard (or notification bell)
  is a natural next step now that `listJoinRequests` exists as an
  endpoint Owners already poll manually.
- The same request-then-approve pattern is reusable for other "ask to
  join something" flows in the product (e.g. crew/project-level access)
  without a new mechanism, just a new model shaped like
  `HouseJoinRequest`.
- Commits: `4e9a1ac`, `0b89445`, `d8a5a92`.
