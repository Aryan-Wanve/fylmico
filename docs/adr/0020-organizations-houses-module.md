# 0020: Organizations/Houses Module

Date: 2026-07-08

Status: Accepted

## Problem

Auth (ADR 0019) unblocked an authenticated user, but almost every other
domain needs a tenant boundary. Per ADR 0011/ADR 0004, `organizations` is
that boundary and `roles` express RBAC; `docs/roadmap.md` already notes the
product calls this concept "House." The frontend's mock service
(`apps/web/src/services/base-workspace.service.ts`) and `docs/api.md`'s
"Base Frontend API Contracts" already define the target shape for
`POST /api/v1/houses`, `POST /api/v1/houses/join`, and
`GET /api/v1/workspace` — nothing backed them yet.

## Decision

Implement `organizations`, `roles`, and `organization_memberships` (the
subset of `docs/database.md`'s "Organizations and access" group this pass
needs) and the three endpoints above. Granular `resource.action` permission
enforcement (`permissions`/`role_permissions`) is explicitly out of scope —
there's no protected resource yet besides the house itself, so there's
nothing to enforce a grant against. That lands with whichever domain
(tasks/projects) first needs it, per ADR 0004.

Specific decisions:

- **Join role default: `"Member"`.** The frontend's `RoleName` union had no
  generic non-owner role. Chosen (over defaulting to the existing `"Client"`
  role, which is semantically for external/limited-access users, or adding a
  `role` field to the join request, which would need a frontend form change
  beyond this pass): add `"Member"` as an 8th `RoleName` value in
  `apps/web/src/types/base.ts`. Purely additive — nothing in the frontend
  currently switches over `RoleName` exhaustively.
- **`User` gains a required `name`.** Neither `HouseMember.name` nor
  `UserProfile.name`/`avatarLabel` could be populated without one, and
  `SignupDto` never collected it (ADR 0019 predates the houses feature that
  now needs it). `avatarLabel` is derived from `name` at read time
  (`apps/api/src/common/avatar-label.util.ts`, shared by the auth and
  workspace modules) rather than stored — it's a UI presentation detail, not
  data.
  - Adding a `NOT NULL` column to `users` required resetting the local dev
    Postgres volume rather than backfilling: the only existing row was the
    disposable test account created while verifying ADR 0019 in the same
    session.
- **Membership presence (`HouseMember.status`) is a placeholder.** Real
  online/away/offline status belongs to the realtime/presence system (ADR
  0005), which doesn't exist. This pass returns `"online"` for the
  requesting user and `"offline"` for everyone else in every response —
  documented as a stand-in, not real presence tracking.
- **`activeOrganizationId` JWT claim resolved.** `User` gains a nullable
  `activeOrganizationId`, set whenever a user creates or joins a house
  (mirrors the mock's "most-recently-created/joined house becomes active"
  behavior — no house-switcher UI exists to make this a real user choice
  yet). The claim is only as fresh as the token's own issuance: creating or
  joining a house does not reissue the caller's current access token, so a
  session's token reflects the active house as of login/signup/refresh time,
  not live. Same treatment as ADR 0019's refresh-reuse simplification —
  documented, not silently accepted.
- **Default roles seeded eagerly at house creation** (Owner/Producer/Editor/
  Videographer/Photographer, matching `defaultRoles` in
  `base-workspace.service.ts` exactly — same names, colors, descriptions).
  **`"Member"` is seeded lazily**, created only the first time someone
  actually joins via invite code, so a freshly created house's `roles`
  array matches the mock's 5 defaults exactly rather than always showing a
  6th, always-empty role.
- **Invite codes**: `{HANDLE_PREFIX}-{4 random digits}` (e.g. `NORT-2048`),
  matching the mock's format, generated with a uniqueness retry loop against
  the `inviteCode` unique constraint.

## Alternatives

- Default new joiners to the existing `"Client"` role. Rejected: `"Client"`
  is meant for external/limited-access users in `docs/permissions.md`'s
  vocabulary, not a generic internal crew member joining via invite link.
- Let the joiner declare their own role (`JoinHouseRequest.role`). Rejected
  for this pass: requires a frontend join-form change beyond a type
  addition, and there's no invite-per-role mechanism to make that meaningful
  yet (a single house has one invite code, not one per role).
- Implement full `permissions`/`role_permissions` now. Rejected: no
  protected resource exists yet to check a grant against; would be
  speculative design, not driven by a real need.
- Backfill the new `users.name` column instead of resetting the dev
  database. Rejected: the only affected row was this session's own
  disposable test data, not something worth writing migration backfill logic
  for.

## Tradeoffs

Benefits:

- Unblocks every domain that needs an organization/tenant boundary.
- Matches the frontend's mock contract exactly, so `apps/web` could in
  principle point at the real API for houses without a contract mismatch.
- Keeps role seeding aligned with the exact UI the mock already established
  (names, colors, descriptions).

Costs:

- No granular permission enforcement yet — anyone authenticated can create
  or join any house; there's no owner-only action to distinguish yet since
  no house-management endpoints (invite/remove members, update house) exist
  in this pass.
- `activeOrganizationId` in the JWT can go stale within a session (see
  Decision above).
- `HouseMember.status` is not real presence data.

## Future Implications

- House-management endpoints (update house, list/remove members, per-role
  invites) and a house-switcher UI are natural next steps once needed.
- Real permission enforcement (`permissions`/`role_permissions`,
  `resource.action` checks) should land with the first domain that actually
  needs to distinguish "Owner can do X, Member cannot."
- Realtime presence (ADR 0005) should replace the `HouseMember.status`
  placeholder once implemented.
- `GET /api/v1/workspace`'s `tasks`/`chatRooms` stay `[]` until their own
  modules exist; this endpoint's shape doesn't need to change when they do,
  just the values.
