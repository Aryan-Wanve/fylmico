# 0055: Projects Module Overhaul — Phase 5 (Project Chat, Timeline, Analytics)

Date: 2026-07-16

Status: Accepted

## Problem

Phases 1-4 gave Projects real Clients, Shoots, Upload Automation, and
Deliverables, but everything discussing a project still happens in
house-wide channels or scattered comment threads, there's no single
chronological record of what happened on a project, and there's no
project-scoped view of the numbers Phases 2-4 already generate (shoots,
editing hours, storage, deliverables). This final phase closes the loop:
a dedicated project chat, a unified activity Timeline, and a per-project
Analytics view - completing the "Project as the single source of truth"
goal the whole overhaul was scoped around.

## Decision

- **`Conversation` gains a nullable, unique `projectId`.** One
  conversation is auto-provisioned (best-effort, same try/catch pattern
  as the Drive-folder and chat-provision calls already in
  `projectsService.create`) whenever a project is created, named
  `"{project name} (Project Chat)"` with a numeric-suffix fallback if
  that name collides with an existing house channel. This reuses **100%
  of the existing chat/realtime infrastructure** (ADR 0044) - ` chatService.sendMessage`/`listMessages`/`useConversationChannel` all
  already operate generically on any `conversationId`; the only backend
  change needed was excluding project-scoped conversations from the
  house-wide room list (`getConversationsForOrganization` now filters
  `projectId: null`) so they don't clutter the general Messages page.
- **`Message` gains a `pinned: Boolean` column** for "Pinned Notes."
  `POST /api/v1/messages/:messageId/pin` toggles it and broadcasts a
  `message:edit` event over the same conversation channel already used
  for live edits - no new realtime event type needed.
- **"Client Feedback" is staff relaying feedback as regular messages in
  this conversation** - there is no client-facing login/portal anywhere
  in this app, and building one is out of scope for this overhaul (flagged
  explicitly in the original plan).
- **New `getProjectTimeline(projectId)`** unions Project/Task creation,
  `TaskActivity` (status changes), Shoot status-transition timestamps,
  and Deliverable submission/status-transition timestamps into one
  `{id, actorName, text, occurredAt}` shape, sorted newest-first - the
  exact same merge-and-sort pattern `dashboard.service.ts`'s house-wide
  `getSummary().recentActivity` already established, just project-scoped
  with more sources.
- **New `getProjectAnalytics(projectId)`** (in `analytics.service.ts`,
  alongside the existing `getMyStats`) reuses the `round1` helper and
  computes: shoots completed/upcoming, editing hours (from
  `TaskTimeEntry` on `type: "edit"` tasks), team hours (all
  `TaskTimeEntry` + `TimeEntry`), storage/files uploaded (via the
  existing `driveKey` prefix scoping from `getProjectStats`),
  deliverable count, avg review time, revision count, and completion %
  (`Project.progress`).
- **Chat tab is a new compact `ProjectChatPanel`**, not a refactor of
  the existing 800-line `messages-page.tsx` into a shared component -
  it reuses the same hooks (`useConversationChannel`) and client
  functions (`sendChatMessage`, `listOlderMessages`) directly, but with
  its own minimal message-list-plus-composer UI. Extracting a fully
  shared room-view component would have been a much larger, riskier
  refactor for a phase whose job is "wire up a project-scoped room,"
  not "unify two chat UIs."

## Alternatives

- **A dedicated `TaskStatusHistory`/`ShootStatusHistory`/
  `DeliverableStatusHistory` table** for a fully accurate Timeline and
  "Avg Review Time"/"Revision Count" analytics. Rejected - none of
  Phases 2-4 built history tables (Shoot and Deliverable both only
  store their _current_ status plus a few named timestamp columns), and
  retrofitting one now is real new schema work out of scope for a phase
  whose job is to surface what already exists. The Timeline and
  analytics instead read the timestamp columns and current status that
  already exist, which is honest about what's actually knowable (e.g.
  "Revision Count" counts deliverables _currently_ in `revision`, not
  every historical revision cycle - documented as a limitation below).
- **A separate realtime event type for pin/unpin.** Rejected - pinning
  is just another field changing on a `Message`, and the existing
  `message:edit` broadcast (added for message editing) already delivers
  a full updated message payload to every subscriber; reusing it means
  zero new client-side event handling.
- **A shared `<ChatRoomView>` extracted from `messages-page.tsx`.**
  Rejected for this phase - see Decision above.

## Tradeoffs

Benefits:

- Zero new realtime plumbing - pin toggling, message delivery, and the
  Chat tab's live updates all ride the exact channel/broadcast
  mechanism built in ADR 0044.
- The Timeline and Analytics endpoints needed no new tables at all -
  every data point already existed somewhere from Phases 1-4.

Costs:

- "Avg Review Time" and "Revision Count" are computed from current
  state (`Deliverable.status`, `updatedAt`/`createdAt`) rather than a
  true event history, so a deliverable that went `review → revision →
review → approved` only ever shows one `updatedAt` timestamp and
  isn't counted as a past revision once it moves on. This is an honest
  reading of the data that exists, not a fabricated precise metric -
  revisit if/when a real status-history table is added.
- `ProjectChatPanel` is intentionally simpler than the full Messages
  page (no reactions, no reply threads, no offline send-queue) - it
  covers the project-chat use case the plan asked for without
  reimplementing every feature of the house-wide chat.

## Future Implications

This completes all 5 phases of the Projects Module Overhaul. Project is
now the single source of truth every major feature connects to
automatically: Clients/stats (Phase 1), Shoots + videographer HUD (Phase
2), upload automation + editing auto-attach (Phase 3), versioned
Deliverables (Phase 4), and Chat/Timeline/Analytics (Phase 5) - with zero
manual folder creation, zero manual stage-advancing, and zero duplicate
organization across the app, per the original spec's closing principle.
