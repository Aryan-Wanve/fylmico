# 0044: Real-Time Chat via Supabase Realtime Broadcast/Presence

Date: 2026-07-15

Status: Accepted

## Problem

Chat had no realtime layer at all. `chat.service.ts` loaded every message in
every conversation on every workspace fetch (no `take`/cursor anywhere), and
every send/reaction/rename refetched the _entire_ workspace snapshot
(`refreshWorkspace()`) rather than the one thing that changed. There was no
typing indicator, no presence, no read receipts, and `unreadCount` was
hardcoded to `0` in the DTO - the whole feature was REST/poll-adjacent at
best, and the only other "live" pattern in the app (`notification-bell.tsx`)
is a 25s poll, explicitly documented in ADR 0023 as a stand-in until a real
realtime layer existed.

The app runs as a single managed Node process on Hostinger (ADR 0034/0037),
behind Hostinger's own reverse proxy, which we don't control and which has
no documented support for passing through WebSocket upgrade requests.
Attaching a custom `ws` server to `server.js` risked silently not working in
production with no way to find out except deploying and testing live.

## Decision

Use **Supabase Realtime** (Broadcast + Presence channels) instead of a
custom WebSocket server. Postgres is already hosted on Supabase (file
storage already uses `@supabase/supabase-js` server-side, ADR 0038), so this
adds no new infrastructure - just a public anon key for the browser.
Critically, the browser connects **directly to Supabase**, not through
Hostinger at all, sidestepping the WebSocket-passthrough unknown entirely.

### Transport

- **Server -> client**: `apps/web/src/server/realtime/broadcast.ts` posts to
  Supabase's `POST /realtime/v1/api/broadcast` REST endpoint (service role
  key) after a message send/reaction/read-receipt persists. This is a plain
  `fetch`, not the `supabase-js` websocket client - no persistent connection
  needed from a stateless Next.js route handler, matching how `mailer.ts`
  already calls Resend's REST API. Degrades to a silent no-op if
  `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are unset, the same fallback
  pattern as the mailer and storage modules.
- **Client <-> client**: typing indicators broadcast directly
  browser-to-browser on the same conversation channel with no server
  round-trip at all - typing state is inherently ephemeral and doesn't need
  persistence or a server hop.
- **Channels**: `conversation:<id>` (messages, reactions, read receipts,
  typing - one shared channel per open conversation, not one channel per
  concern), `house:<id>:chat` (a lightweight digest event per message -
  conversation id/preview/sender/timestamp - so the sidebar list can reorder
  and update unread counts without subscribing to every conversation's full
  channel), `house:<id>:presence` (Supabase Presence - who's online).

### Data model additions

- **`ConversationRead`** (`conversation_id`, `user_id`, `last_read_message_id`,
  `last_read_at`, unique per pair): replaces the hardcoded `unreadCount: 0`.
  `unreadCount` is computed by comparing each conversation's _currently
  loaded_ messages (capped to the last 50, see below) against the caller's
  `last_read_at` - an approximation if unread count ever exceeds 50 messages
  since the last read, accepted as a reasonable edge case for a Phase 1 chat
  rebuild.
- **`User.lastSeenAt`**: presence's "last seen" fallback for when a user has
  no live Presence entry. Supabase Presence gives instant, correct
  online/offline while connected; this column only covers the
  offline-display case. Updated by a lightweight `POST /auth/me/heartbeat`
  the client calls periodically while active - not on every request (that
  would add a DB write to every authenticated call for no reason).

### chat.service.ts reshape

- `roomInclude`'s message include gained `take: 50` (was unbounded) - every
  workspace load previously pulled every message ever sent in every
  conversation.
- `sendMessage`/`toggleReaction` now return **only the affected message**,
  not the whole re-fetched room - the eliminated over-fetch this ADR exists
  to fix.
- New `listMessages` (cursor-paginated, reuses the existing
  `buildPage`/`resolveLimit` helpers already used by
  `notifications.service.ts`) backs a "load earlier messages" control -
  the first pagination chat has ever had.
- New `markRead` upserts `ConversationRead` and broadcasts a `read` event so
  the sender's client can show a read tick without polling.

### Client architecture

- `lib/realtime/supabase-client.ts` - lazy anon-key client, `null` if
  unconfigured (same graceful-degradation shape as the server side).
- `lib/realtime/use-conversation-channel.ts` - one hook, one channel per
  open conversation, handling messages/reactions/read-receipts/typing
  together (deliberately not four separate hooks/channels for one topic).
- `lib/realtime/use-house-chat-digest.ts` - the sidebar-list channel.
- `lib/realtime/use-presence.ts` - Presence tracking, exposes the online
  user-id set.
- `lib/use-ticker.ts` - one shared 30s interval forcing re-renders so
  relative timestamps ("2 min ago") and last-seen strings stay fresh
  without every message/member mounting its own `setInterval`.
- `messages-page.tsx` holds chat state as local, patchable `Channel[]`
  (seeded from the workspace snapshot, then mutated in place by realtime
  events and optimistic sends) instead of re-deriving everything from
  `workspace.chatRooms` on every change - `refreshWorkspace()` is now only
  called for structural changes (create/rename a channel), never for a
  send/react/read.
- Optimistic send: a client-generated temp id is appended locally with
  `status: "sending"`, swapped for the server-confirmed message once the
  POST resolves (or removed with an alert on failure). Supabase Broadcast's
  default `self: false` means the sender never receives its own broadcast
  back, so there's no self-echo dedup needed - only _other_ connected
  clients see the message via the channel.
- Message states: `sending` (optimistic, pre-POST) -> `sent` (POST
  resolved) -> `read` (derived from the latest `read` event timestamp from
  any other conversation member exceeding the message's `sentAt`). A
  distinct `delivered` tick (server pushed it to an actively-connected
  recipient, short of read) was scoped out of this pass - see Costs.
- Scroll behavior: auto-scrolls to bottom only when the user was already
  near the bottom (tracked via a scroll-position ref, not React state, to
  avoid re-render churn on every scroll event); otherwise shows a "New
  messages" pill. "Load earlier messages" preserves scroll position by
  measuring `scrollHeight` before/after prepending older messages.
- Message grouping: consecutive messages from the same sender within 5
  minutes collapse the repeated avatar/name.

## Alternatives

- **Custom `ws` server on `server.js`.** Rejected: unverified whether
  Hostinger's managed reverse proxy passes through `Upgrade: websocket` at
  all - would require a live canary test in production with no local way to
  confirm first, and failure would be silent (chat would just never
  connect, no error surfaced). Supabase Realtime sidesteps this because the
  browser talks to Supabase directly, never through Hostinger.
- **SSE + polling hybrid.** Rejected: weaker for the bidirectional pieces
  (typing indicators, presence) the spec explicitly asked for; would still
  need a separate mechanism for client-to-client typing broadcast.
- **Direct Postgres-changes subscriptions (RLS-gated)** instead of
  Broadcast. Rejected for this pass: this app's Postgres uses default-deny
  RLS with Prisma connecting as the table-owning role (see the
  `20260711090257_enable_row_level_security` migration) - the app has no
  Supabase Auth integration (`auth.uid()` doesn't exist for our users,
  since auth is a fully custom JWT/argon2 system, ADR 0019), so wiring
  RLS-authorized realtime table subscriptions would mean either migrating
  to Supabase Auth or minting Supabase-compatible JWTs per session just for
  this. Broadcast/Presence channels need no RLS at all, so this was
  deferred - see Costs and Future Implications.

## Tradeoffs

Benefits:

- Zero new hosting/infrastructure decisions - reuses the Supabase project
  already backing Postgres and file storage.
- Sidesteps the unverified Hostinger WebSocket-passthrough risk entirely by
  connecting client-to-Supabase directly.
- `@supabase/supabase-js` was already a dependency (server-side storage) -
  no new package for the client either.
- Multi-tab/multi-device sync is free: every open tab independently
  subscribes to the same channels and receives the same broadcasts, with no
  extra code.

Costs:

- **Channel names are unguessable-cuid capability tokens, not
  access-controlled.** Anyone holding the public anon key who somehow
  learns a conversation's id could subscribe to its channel (Realtime
  "private channels" with RLS authorization were not set up - see
  Alternatives). This mirrors the trust model this app already uses
  elsewhere for invite links and reset tokens (ADR 0036/0039) - unguessable
  rather than access-list-enforced - but it's a real gap relative to the
  DB-level membership checks every REST chat endpoint already enforces.
- **No true "delivered" state** - only sending/sent/read. A real delivered
  tick (recipient's client actively received the push, distinct from having
  read it) was scoped out; sent and delivered are visually the same today.
- **`unreadCount` approximates from the last 50 loaded messages per
  conversation**, not a true full-history count.
- **No message-list virtualization.** Given the 50-message cap plus
  pagination already bounds DOM size per conversation, a virtualization
  library (react-window/react-virtual - neither previously a dependency)
  was judged disproportionate for this data scale and deliberately not
  added. Revisit if the cap is ever raised significantly or a house's chat
  volume grows well beyond typical use.
- Presence/typing are purely ephemeral (no history) - if no client is
  connected to a channel, a typing ping or presence join is simply never
  seen by anyone, which is the correct behavior for both features.

## Future Implications

- If stricter channel-access control is ever needed, migrating to Supabase
  Realtime's "private channels" (RLS on `realtime.messages`, gated by a
  Supabase-signed JWT minted per session with the user's id as a claim)
  is the documented upgrade path - deferred here for scope, not because it
  isn't the more correct long-term answer.
- A true `delivered` tick is addable later as another ephemeral broadcast
  (recipient acks receipt of `message:new` back to the sender) without any
  schema change.
- `RECENT_MESSAGES_LIMIT` (currently 50) and the pagination page size are
  both centralized constants - easy to tune if usage patterns demand it.
- The outbound send-queue (offline support, see the commit alongside this
  ADR) uses `localStorage` and flushes on `window.online` - if this
  project ever needs delivery guarantees stronger than "best-effort
  retry from the tab that queued it," that queue would need to move
  server-side (an actual outbox table) instead.
