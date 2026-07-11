# 0036: House Invitations and Leave-House

Date: 2026-07-11

Status: Accepted

## Problem

ADR 0020 shipped house creation and joining via a single house-wide invite
code, and the "Invite Member" buttons on the Crews page and Settings ->
Members page were only ever decorative: Crews' version showed the real
invite code via `window.prompt`, but Settings' version was `window.prompt
("Invite by email")` that discarded whatever was typed and called no API.
There was also no way for a member to voluntarily leave a house — only
`removeMember` existed, callable only by (any) other member against someone
else, per ADR 0028.

## Decision

Add targeted, revocable email invitations and a self-service leave-house
action, both built on the existing `AuthAccount`-adjacent pattern of opaque
tokens hashed server-side (ADR 0019's `EmailVerificationToken`/
`PasswordResetToken` precedent) rather than a new auth mechanism.

- **New `HouseInvitation` model** (`organizationId`, `email`, `tokenHash`
  unique, `invitedById`, `status` (`pending`/`accepted`/`revoked`),
  `expiresAt` (7 days), `acceptedById`/`acceptedAt`). A second table
  alongside the existing house-wide `inviteCode` on `Organization`, not a
  replacement for it — the invite code remains the "share this code with
  anyone" mechanism (still used by Crews' existing prompt), while
  `HouseInvitation` is the "send this specific person a link" mechanism.
- **The invite link is returned directly in the API response** (
  `inviteUrl` on `POST /houses/:houseId/invitations`), not just logged
  server-side like password-reset tokens. Reasoning: a password-reset
  token is a credential that must stay secret from everyone but its
  recipient; an invite link is closer to the already-plaintext
  `inviteCode` — the whole point is handing it to someone else. Since
  there's no email provider yet (per ADR 0019), returning it directly lets
  the frontend copy it to the clipboard immediately so the inviting user
  can actually send it (Slack, WhatsApp, email client) instead of needing
  to check server logs. Only shown once, at creation time — the token
  itself is still stored only as a hash, so it can't be recovered later if
  lost; re-inviting the same email generates a fresh token and silently
  revokes the previous pending one for that address.
- **CSRF-equivalent concern doesn't apply here** (unlike the Google OAuth
  `state` cookie in ADR 0035) — accepting an invitation requires being
  logged in and holding the unguessable token from the link itself; there
  is no cross-site redirect step to protect.
- **Account linking mirrors `joinHouse`**: both `joinHouse` (by invite
  code) and the new `acceptInvitation` (by token) now call a shared private
  `addMembership` that checks for an existing membership, gets-or-creates
  the `Member` role, creates the membership + crew profile, sets
  `activeOrganizationId`, and notifies house owners — extracted from
  `joinHouse`'s body rather than duplicated.
- **`leaveHouse`**: blocked with `400 invalid_request` if the requester is
  the house's only member (mirrors `removeMember`'s identical "cannot
  remove the last member" guard from ADR 0028, now reachable by the member
  themself, not just by someone else removing them). On success, clears
  `activeOrganizationId` if it pointed at the house just left, falling back
  to another house the user still belongs to, or `null` if none — the
  existing `(app)/layout.tsx` auto-redirect to `/houses/new` when there's
  no active house handles the rest with zero new frontend routing logic.
- **New public routes**: `GET /invitations/:token` (preview - house name/
  description, invited email, inviter name; no auth, so the frontend can
  show who's inviting whom before asking someone to log in) and
  `POST /invitations/:token/accept` (requires auth). These live in a new
  `InvitationsController` separate from the existing house-scoped,
  controller-level-guarded `OrganizationsController`, since a single
  guarded controller can't expose one public method.
- **Frontend**: Settings -> Members now has a real invite form (email
  input, calls the API, copies the returned link to the clipboard, lists
  pending invitations with per-row revoke) and a "Danger Zone" card with
  "Leave House" (window.confirm, same pattern as Crews' remove-member
  confirm). A new public page, `apps/web/src/app/houses/invite/[token]`,
  renders the preview and either an "Accept & Join" button (if
  `hasSession()`) or login/signup links (if not) - no redirect-back-after-
  login wiring was added; the user re-opens the same link post-login,
  consistent with this app's existing minimal-redirect conventions.

## Alternatives

- Send real invitation emails now. Rejected: no email provider is chosen
  yet (same deferred decision as ADR 0019); the frontend-clipboard-copy
  approach is the same "temporary, honest stand-in" pattern already used
  for password reset, just returned to the client instead of only logged.
- Gate `acceptInvitation` on the accepting user's email matching the
  invited email exactly. Rejected for this pass to keep the flow simple
  (anyone holding the link can accept, same trust model as the existing
  invite code) - worth revisiting if invitations are ever used for
  something more sensitive than "join this house."
- Let a house's last owner leave if other (non-owner) members remain,
  requiring an ownership transfer first. Rejected as out of scope: the
  existing "last member" guard (not "last owner") was the bar already set
  by `removeMember` in ADR 0028; matching it exactly avoids introducing a
  new, asymmetric rule in the same pass that adds `leaveHouse`.

## Tradeoffs

Benefits:

- Invitations are now targeted (one email, one link, revocable,
  expiring) rather than everyone sharing one permanent code - closer to
  what "invite members" implies on the Settings page's own copy.
- `leaveHouse` and `removeMember` now share the same last-member floor,
  so a house can never be silently emptied via either path.
- No new npm dependency - reuses `token.util.ts`'s existing opaque-token/
  hash/TTL helpers verbatim.

Costs:

- Returning `inviteUrl` in the API response means it's visible to
  anything with access to that HTTP response (browser devtools, request
  logs) for as long as it's cached there - a materially different exposure
  profile than password-reset tokens, accepted here because the link's
  only power is "join this specific house," not "take over this account."
- No email delivery, so an invited person only learns about the invite if
  the inviter manually sends them the copied link - a real gap until an
  email provider exists.
- No ownership-transfer flow yet, so a solo owner in a multi-member house
  can leave (dropping to "Member"-only ownership of nothing) only by first
  asking another member to also hold "Owner," which nothing in the product
  currently exposes as a role-editing UI.

## Future Implications

- Once a real email provider is chosen, `inviteMember` only needs a mailer
  call added alongside (not instead of) the existing `inviteUrl` return -
  no schema or token-handling change required.
- If per-role invitations become a need (invite someone directly as
  "Producer" rather than always "Member"), `HouseInvitation` would need a
  `roleId` column - a small additive migration.
- A future ownership-transfer or role-editing feature should specifically
  handle the "last owner leaving" case flagged above.
