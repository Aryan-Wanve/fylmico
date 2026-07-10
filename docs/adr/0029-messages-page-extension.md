# 0029: Messages Page Extension

Date: 2026-07-10

Status: Accepted

## Problem

Unlike Tasks/Projects/Crews, the Messages page's mock wasn't just missing
fields on an otherwise-matching backend model - its shape was
structurally bigger than what real chat (ADR 0021) supports at all:
per-message file attachments, per-channel Files/Tasks/Events sub-resources
embedded directly on each channel, a DM (`kind: "dm"`) distinction with no
backing 1:1 messaging model, client-tracked `pinned`/`unreadCount` state,
and a realtime "typing…" indicator with no realtime transport (Socket.IO,
ADR 0005, still not implemented). None of these have a real backend
counterpart, and building all of them would be a materially bigger scope
than this pass (each is close to its own ADR-sized feature: object
storage for attachments, a DM data model, a notifications-style
read-cursor system, a websocket layer).

## Decision

- **Wire the core "Messages" tab to real `Conversation`/`Message` data**,
  which was already fully built (ADR 0021) and already flows through
  `GET /workspace`'s `chatRooms` - the same pattern Tasks used for
  `workspace.tasks`. No new fetch needed; `sendChatMessage` already
  existed too.
- **Add `POST /api/v1/houses/:houseId/conversations`** so "New Chat" can
  create a real channel instead of a fabricated local-only one - the one
  piece of real, reasonably-scoped backend work this pass adds. Rejects
  duplicate names within a house (`409 channel_name_taken`), enforced by
  the existing `(organization_id, name)` unique constraint.
- **Drop the DM concept entirely.** Every real `Conversation` is a
  house-wide group channel (ADR 0021); there is no 1:1 messaging model.
  `Channel.kind` becomes a literal `"group"` (not a union), which let
  `ChannelAvatar` and `ChannelInfoPanel` drop their now-dead DM branches
  outright rather than leaving unreachable code behind.
- **Drop file attachments (messages and the composer's paperclip
  button)** - no object storage exists (same reasoning as Tasks/Projects).
  The composer's attach/emoji/formatting buttons were already
  non-functional decorative UI before this pass; left as-is.
- **Keep the Files/Tasks/Events tabs, but always empty.** Removing them
  outright would touch `chat-tabs.tsx` and three list components for a
  bigger UI refactor than this pass's scope justifies, and each already
  has a real "nothing here yet" empty state. They now render truthfully
  empty (no real per-channel file/task/event backend exists) rather than
  being deleted or showing fabricated content.
- **`unreadCount` stays exactly what the backend returns: always `0`.**
  `ChatService.sendMessage`'s DTO has hardcoded `unreadCount: 0` since
  ADR 0021 (no read-cursor tracking exists). Rather than inventing a
  client-only "unread since last visit" approximation that resets on
  every reload and isn't synced across devices or tabs, the "Unread"
  filter is left wired to the real (currently always-zero) value -
  honest about the gap instead of simulating a feature that doesn't
  really exist yet.
- **`pinned` is dropped entirely** (was previously going to be
  client-only state, but nothing in the UI actually toggles it - the mock
  never had a working pin button either) rather than kept as dead state.
- **Member list uses real house members**, not per-channel membership -
  every house member can see/post in every conversation (no
  `conversation_members` table), so `Channel.memberIds` is simply "every
  member of the active house."

## Alternatives

- Build a real per-message attachment system now. Rejected: needs object
  storage, which doesn't exist anywhere in the backend yet and is a
  cross-cutting prerequisite (also needed for Project cover photos and
  the entire `/files` page) - better solved once, not bolted onto chat
  alone.
- Build a DM data model (a `Conversation` with exactly 2 members, or a
  separate `DirectMessage` table). Rejected: real scope creep beyond
  "wire the group-chat UI that already has a backend" - group channels
  were the only chat concept ADR 0021 actually built.
- Remove the Files/Tasks/Events tabs from the UI entirely instead of
  leaving them always-empty. Rejected for this pass on cost/benefit: a
  meaningfully bigger diff across `chat-tabs.tsx` and three list
  components for marginal clarity gain, since each already renders an
  honest "nothing yet" empty state rather than fabricated content.
- Approximate unread counts with client-side local storage (track last-
  seen message id per channel). Rejected: wouldn't sync across devices/
  tabs and would silently misrepresent itself as a real feature; simpler
  and more honest to leave the field at the real backend's current value.

## Tradeoffs

Benefits:

- The Messages page's core loop - viewing real house channels, reading
  real messages, sending real messages, creating a new real channel - now
  round-trips through the real API instead of a 10-channel hardcoded
  mock. curl-verified: created a channel, confirmed duplicate-name
  rejection.
- No fabricated data anywhere: every visible field is either real or an
  honestly-empty placeholder for a feature that doesn't exist yet
  (Files/Tasks/Events/attachments/unread count).

Costs:

- Files/Tasks/Events tabs are currently dead weight in the UI - present,
  navigable, but permanently empty until their own backend domains exist.
- No DMs, no attachments, no realtime typing indicator, no working unread
  tracking - Messages is the least "complete" of the four pages wired up
  this session (Tasks, Projects, Crews, Messages), reflecting that its
  mock was genuinely the most ambitious relative to what ADR 0021 built.
- **Live browser verification could not be completed this pass** - the
  browser preview tooling was unavailable during this work (both the
  standard preview tools and the Chrome extension reported not
  connected). Backend behavior is curl-verified and both frontend
  typecheck/lint/build are clean, but the live in-browser click-through
  verification every other module in this session received did not
  happen for Messages. Should be done as a follow-up once tooling is
  available again.

## Future Implications

- Object storage remains the single biggest unblocking prerequisite
  across three separate features now (Task/Project/Message attachments,
  Project cover photos, the entire `/files` page).
- A DM/1:1 messaging model, if ever built, is a genuinely separate data
  model from house-wide `Conversation` channels - not an extension of it.
- Live browser verification for the Messages page is still owed and
  should happen before this ADR's confidence is treated as equivalent to
  ADR 0026/0027/0028's (which were all verified live).
