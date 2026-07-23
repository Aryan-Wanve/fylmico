# 0061: Client review & approval system

Date: 2026-07-23

Status: Accepted

Builds on: [0060](0060-frameio-style-review-system.md)'s internal Frame.io-style
review workspace (player, timeline, annotations, threaded comments).

## Problem

Approving a draft internally (`ApproveDialog`) immediately finalized a
deliverable - marked the task complete and optionally copied the file into
Deliveries/Portfolio. Clients never saw or interacted with a video at all;
there was no way to actually get their sign-off before calling something
final. The user wants a real client-approval loop: after internal approval,
staff choose to finalize immediately ("Mark as Final Internally" - the
existing flow, unchanged) or send the video to the client via a secure,
tokenized, unauthenticated link. The client reviews, comments, and formally
approves or requests changes themselves, with that decision syncing back
into the internal workspace in real time.

Three architecture forks were resolved with the user before building this:
hosting is the same Next.js app, path-based (not a separate
subdomain/deployment); watermarking is skipped entirely (no
video-transcoding pipeline exists to burn one in); and OTP is required once
per browser (a signed cookie remembers a verified browser afterward) rather
than trying to detect "a different device", which isn't reliably possible
server-side.

## Decisions

1. **`Comment` and `DeliverableActivity` are reused for client-authored
   rows**, not duplicated into parallel client-only tables. Both models'
   `authorId`/`actorId` become nullable, gaining `authorType`/`actorType`
   (`"user" | "client"`) plus `guestName`/`guestEmail` (`Comment`) or
   `actorLabel` (`DeliverableActivity`) for the client case. A client has
   no Fylmico `User` row, so this was the only way to have them drive the
   same comment threads and audit trail as internal staff without a second
   data model.
2. **A `DeliverableActor` union threads through the mutation layer**:
   `{ type: "user"; id: string } | { type: "client"; label: string }`.
   `deliverablesService.transition()`/`logActivity()` took this instead of
   a bare `userId` - `transition()` skips `requireMembership` entirely when
   `actor.type === "client"` (the caller is already authorized upstream by
   `requireVerifiedSession`, not organization membership). Every existing
   internal call site (`create`, `markFirstReviewed`, `requestRevision`,
   `reject`, `approve`) was updated to wrap `{ type: "user", id: userId }` -
   mechanical, but real surface area across ~6 call sites.
3. **No new "version" column anywhere.** Each `Deliverable` row already _is_
   one version (the existing `(taskId, version)` unique index enforces
   this). A `ReviewSession` points at exactly one `Deliverable`; when
   `allowVersionSwitch` is on and a different version is requested,
   `resolveViewedDeliverable()` looks up a sibling `Deliverable` sharing the
   same `taskId`. Comments stay attached to whichever version they were
   left on for free, since `Comment.commentableId` already scopes per
   version. Approve/RequestChanges always act on the session's own bound
   `deliverableId`, never on whatever version is currently being previewed
   through the switcher - the public page shows an explicit banner when the
   two differ, since a client who switches to an older cut and then hits
   Approve could otherwise believe they approved what's on screen.
4. **Access control mirrors two existing patterns exactly** rather than
   inventing new ones: the opaque-token + SHA-256-hash pattern
   `HouseInvitation` already uses (`generateOpaqueToken`/`hashOpaqueToken`/
   `addDuration` from `token.util.ts`; the raw token is never persisted),
   and the OTP-with-attempt-lockout pattern `auth.service.ts`'s
   `verifyEmail()` already uses (5-attempt lockout, hash compare,
   `consumedAt`). A `REVIEW_SESSION_COOKIE_SECRET` is a **dedicated** env
   var (not `JWT_ACCESS_SECRET`) so a leak or bug in the client-portal
   cookie can't touch the main session token; the cookie name itself is
   per-session (`fylmico_review_${reviewSessionId}`), so verifying one
   client link never clobbers another still-unverified one in the same
   browser.
5. **Public video playback reuses `signDownloadToken`** (the same
   short-lived JWT the existing `/api/v1/files/download/[token]` route
   already accepts with no membership check) rather than building new
   file-serving infrastructure - "the token IS the credential" was already
   the trust model for that route.
6. **Realtime and notifications reuse the existing Supabase-broadcast and
   notification-type-registration patterns** verbatim
   (`deliverableReviewTopic(deliverableId)`, five new notification types:
   `review_client_viewed`, `review_client_commented`,
   `review_changes_requested`, `review_client_approved`,
   `review_link_expired`). Link expiry is checked lazily on next access
   (inside `findValidSession()`), not via a scheduled job - no cron infra
   exists in this app.
7. **The public page is a separate top-level route,
   `/client-review/[token]`**, deliberately not `/review/[token]` - that
   path shape is already the internal authenticated workspace route
   (`/review/[deliverableId]`), and reusing it would have collided at the
   router level. It sits outside the `(app)` route group entirely, the
   same way `/houses/invite/[token]` does, so it never renders any
   houses/dashboard/tasks/chat chrome.
8. **The shared player components are reused as-is, not forked.**
   `PlayerProvider`/`ReviewVideoPlayer`/`PlayerControlsBar`/`ReviewTimeline`
   already took `src`/`fps` as props with no authenticated-service calls
   baked in, so the public page composes them directly. Two small,
   non-breaking extensions were needed: `PlayerControlsBar` gained an
   optional `hideFullscreen` prop (default `false`) for when a session's
   `allowFullscreen` is off, and `ReviewTimeline`'s `comments` prop was
   loosened from the full internal `Comment` type to a minimal structural
   `TimelineComment` (`id`/`body`/`parentId`/`timestampSeconds` - all it
   actually reads), since the public page's `ReviewClientComment` shape
   (guest authors, no mentions/pins) doesn't structurally match `Comment`
   but does satisfy the narrower type.
9. **A separate, isolated public fetch client**
   (`services/review-session-public.service.ts`) rather than reusing
   `lib/api/client.ts`'s `apiRequest()`. These routes authenticate via the
   review-session cookie, never a bearer token, and `apiRequest`'s 401
   handling calls `clearSession()` - which would incorrectly sign a staff
   member out if they opened a client review link while logged in.
10. **Password protection is a client-side-only gate**, not a second
    session mechanism. `verifyPassword()` has no server-side side effect
    (no cookie, no state change) - the public page just tracks whether the
    password step passed locally before showing the OTP gate. The real
    access boundary is still the OTP-verified cookie checked by
    `requireVerifiedSession()` on every content/action route.
11. **Client-facing comment threads are a simplified, separate component**
    (`ClientCommentThread`), not the internal `CommentThreadPanel` reused
    with feature flags - no mentions, pins, edit, delete, or resolve, since
    none of those are in the client-facing spec and surfacing them (roles,
    other internal threads) would leak internal concepts onto a page
    clients see.

## Implementation

**Schema**: new `ReviewSession` (client email, token hash, subject/message,
six include/allow toggles, optional password hash, status machine
`pending | viewed | reviewing | changes_requested | approved | expired |
revoked`, expiry/activity timestamps) and `ReviewOtpToken` (mirrors
`EmailVerificationToken`). `Comment`/`DeliverableActivity` gain the nullable
actor + guest fields described above. Migration
`20260723080000_client_review_system` (hand-written to work around a
pre-existing, unrelated shadow-database bug in an older migration - applied
via `prisma migrate deploy` instead of `migrate dev`).

**Backend**: `review-sessions.service.ts` (`createAndSend`,
`listForDeliverable`, `getPublicPreview`, `verifyPassword`, `requestOtp`,
`verifyOtp`, `requireVerifiedSession`, `findValidSession`, `logActivity`).
`review-client-actions.service.ts` (`getContent`, `addComment`, `addReply`,
`toggleReaction`, `approve`, `requestChanges`), all gated by
`requireVerifiedSession`, never `requireUser`. `deliverablesService` gained
`approveViaClientReview`/`requestRevisionViaClientReview`, both building a
`{ type: "client", label: clientEmail }` actor. New mail templates
(`buildClientReviewInviteEmail`, `buildReviewOtpEmail`). Eleven new routes
under `deliverables/[id]/review-sessions` (authenticated) and
`review-sessions/[token]/*` (public).

**Frontend**: `DraftApprovedDialog` (Send to Client / Mark as Final
Internally / Cancel) now sits in front of the existing `ApproveDialog`;
`ClientDeliveryDialog` collects every send-time field; `ClientReviewStatusPanel`
shows live client status in the internal workspace via
`useDeliverableReviewChannel`. The public page
(`app/client-review/[token]/page.tsx`) is a state machine - preview → optional
password gate → OTP gate → content - composing the reused player with new
public-only components (`OtpGate`, `PasswordGate`, `ReviewCountdown`,
`ClientCommentThread`, `ClientApproveDialog`, `ClientRequestChangesDialog`).

## Consequences

- Two identical-shaped dynamic routes now coexist without collision:
  `/review/[deliverableId]` (internal, inside `(app)`) and
  `/client-review/[token]` (public, standalone) - a naming decision future
  routes under `/review` should keep in mind.
- Approving from the client portal no longer requires the internal
  `ApproveDialog`'s options (final name, portfolio category) - client
  approval always uses the deliverable's existing name and skips portfolio
  addition, matching that the client isn't a Fylmico user making that
  internal-only call.
- The public API surface is deliberately minimal: no internal ids
  (`deliverableId`, `organizationId`, storage paths), no staff names
  (comments from internal users render as "Team"), only opaque tokens and
  version numbers ever cross the boundary.
