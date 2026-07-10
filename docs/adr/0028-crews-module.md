# 0028: Crews Module

Date: 2026-07-10

Status: Accepted

## Problem

The standalone Crews page's mock modeled "crew members" as a roster
independent of real house membership - `crewMembers: CrewMember[]` with
fabricated `id`/`email` values, an "Invite" flow that created a fake
member from just a typed name (no account, no email, no way to actually
log in), and a "Remove" flow that just deleted a local array entry. None
of this maps onto the real backend: houses are joined by an actual user
signing up and using a real invite code (ADR 0020), not by an admin typing
a name into a form. Wiring this page to real data required resolving that
mismatch, not just adding fields.

## Decision

- **A crew member is a real house member, period.** No separate/fake
  roster. The Crews page now reads real `User` + `OrganizationMembership`
  records, each extended with a new `CrewProfile` row (department, role
  category, availability status, current assignment, birthday - the
  production-specific fields the UI needs that don't belong on the core
  identity/membership models).
- **`CrewProfile` is auto-seeded, not user-created.** Every time someone
  creates or joins a house (`OrganizationsService.createHouse`/
  `joinHouse`), a `CrewProfile` row is created for them automatically,
  with `jobTitle` defaulted to their house role's name (`"Owner"`,
  `"Member"`, etc.) and `department`/`roleCategory`/`status` defaulted
  sensibly. This guarantees every house member always has a crew profile
  to view/edit - there's no "invite a crew member" endpoint, because
  creating a crew member _is_ joining the house.
- **"Invite Member" now reveals the house's real invite code** instead of
  fabricating a member. This is a reinterpretation of the button's intent
  (bring a new person onto the team) mapped onto the mechanism that
  actually exists (share the code, they sign up and join themselves) -
  not a UI regression, since the mock's version never created anything a
  real person could use anyway.
- **"Remove" now really removes the person from the house** - deletes
  their `OrganizationMembership` and `CrewProfile` in one transaction
  (`OrganizationsService.removeMember`, this codebase's first member-
  removal capability). This is destructive and immediate: the removed
  person loses house access right away. Guarded only against removing a
  house's last remaining member (would orphan the house); no finer-
  grained "only an Owner can remove people" check exists, matching the
  no-RBAC posture already accepted throughout ADR 0020's lineage.
- **No avatar photos.** Same policy as Tasks/Projects - no object storage
  exists, so every crew member's avatar is initials-only.

## Alternatives

- Keep "Invite" creating a placeholder person, marked somehow as
  "pending"/unregistered. Rejected: this would require a whole invite-
  and-claim flow (pending invitee records, claim-by-email-link) that's a
  meaningfully bigger feature than this pass's scope, and the house
  already has a working invite-code mechanism (ADR 0020) that does the
  same job today.
- Store department/status/availability directly on
  `OrganizationMembership` instead of a separate `CrewProfile` table.
  Rejected: keeps identity/membership concerns (who belongs to which
  house, with what role) cleanly separate from page-specific profile
  data that only the Crews UI reads.
- Require an explicit RBAC check (only Owners can remove members) before
  building `removeMember`. Rejected for this pass, consistent with every
  other module's already-accepted "no finer-grained role check yet" gap -
  adding real RBAC is a cross-cutting change that belongs in its own
  pass, not bolted onto this one destructive endpoint alone.

## Tradeoffs

Benefits:

- The Crews page is now fully real: list, edit-in-place (via `PATCH`,
  though the current UI doesn't yet expose a full edit form - the
  endpoint exists ahead of the UI for it), and remove all round-trip
  through the real API - verified live in-browser, including the
  last-member guard correctly blocking removal and the UI surfacing the
  error without crashing.
- Every crew member is a real, loggable-in account - no dead-end
  fabricated rows.

Costs:

- Removing a member is immediate and irreversible with no confirmation
  beyond a browser `confirm()` dialog, and no "only Owners can do this"
  check - a real safety gap once real users are on this, flagged
  explicitly rather than silently shipped.
- `PATCH .../crew/:userId` exists but the current Crews page UI has no
  edit form wired to it yet - members can be viewed and removed, but not
  yet re-departmentalized or have their status changed, through the UI
  (the API supports it; the UI doesn't call it yet).

## Future Implications

- Real RBAC (only Owners/certain roles can remove members) is now a
  concretely scoped gap across every module, not just this one - worth
  solving once, broadly, rather than per-endpoint.
- An edit-crew-profile UI (department/status/current-project form) is a
  natural next increment now that the endpoint exists.
- Files, Storyboard, Bookings, and Analytics still need their own
  from-scratch backend domains; Messages still needs its embedded-widget
  treatment.
