# 0038: Drive-Backed File Storage

Date: 2026-07-12

Status: Accepted

## Problem

ADR 0037 (Phase E) wired the Files domain to Supabase Storage - every
uploaded file's bytes lived in a Fylmico-owned bucket, billed to Fylmico.
The product direction is to keep Fylmico's own storage bill to near-zero:
account data (name, username, avatar) stays with Fylmico, but a user's
actual production files should live in _their own_ Google Drive, in a
"Fylmico" folder Fylmico creates and manages on their behalf.

## Decision

- **Per-user Drive connection, not per-house.** A new `DriveConnection`
  model (`user_id` unique, `refresh_token`, `drive_folder_id`,
  `google_email`) stores one Google Drive OAuth grant per `User`. This is
  a second, separate OAuth flow from ADR 0035's login flow: it requests
  `drive.file` + `userinfo.email` scope with `access_type=offline` and
  `prompt=consent` (to guarantee a refresh token), whereas login uses
  `access_type=online` and never needs one. `drive.file` is Google's
  restrictive scope - the app can only see/touch files and folders it
  itself creates, never the user's whole Drive.
- **Connect flow smuggles identity through `state`, not a cookie.** Login's
  OAuth uses a `state` cookie because the browser already has an app
  session by the time `/auth/google` redirects. Connecting Drive happens
  _from inside_ the authenticated app, where the only credential is a
  Bearer token in a JS variable - unusable across a top-level browser
  navigation. So `GET /drive/connect-url` (authenticated, called via
  `fetch`) mints a signed JWT `state` embedding the caller's `userId`
  (`drive-token.util.ts`, reusing `JWT_ACCESS_SECRET`) and returns the
  full Google consent URL; the frontend does a real `window.location`
  navigation to it. `GET /drive/callback` verifies and decodes that state
  to recover the user - no cookie, no session needed at that point. The
  signature itself is what makes the state unforgeable (equivalent CSRF
  protection to a cookie, since only `/drive/connect-url` can mint one).
- **`FileEntry` stays the shared, house-scoped index.** Its `storagePath`
  column is repurposed to hold a Google Drive file ID instead of a
  Supabase Storage path - the row itself, the folder tree, and every
  membership check in `files.service.ts` are unchanged. This means a
  house's file tree still shows everyone's uploads together; only _where
  the bytes physically live_ changed, and it's always the uploader's own
  Drive (`uploadedById` doubles as "whose Drive to use" - no new column
  needed).
- **Downloads proxy through the server, not a Drive share link.** Sharing
  every file with every house member's Google account (or making
  everything "anyone with the link") would leak access control out of
  Fylmico's own membership system. Instead, `getDownloadUrl` mints a
  short-lived signed token (`signDownloadToken`, 10 minutes, same JWT
  mechanism as the connect state) and returns
  `{appUrl}/api/v1/files/download/{token}`. The unauthenticated
  `GET /files/download/[token]` route verifies the token, loads the
  `FileEntry`, fetches the bytes from the _uploader's_ Drive via a fresh
  access token, and streams them back with the original filename/
  mimetype - the token, minted only after a membership check, is the only
  credential needed, matching the trust model of the old Supabase signed
  URL it replaces.
- **No access-token caching.** `getValidAccessToken` calls Google's
  refresh-token grant on every upload/download/delete rather than caching
  the short-lived access token and its expiry. Simpler, and this isn't a
  hot path (unlike login) - one extra token exchange per file operation
  is an acceptable cost for not needing an expiry-tracking column.
- **Avatars are unaffected.** Profile pictures stay in Supabase Storage's
  `avatars` bucket (small, low-cost, and unrelated to the "user's own
  files" problem this ADR solves) - `auth.service.ts` still calls
  `uploadObject`/`getPublicUrl` from `storage/supabase-storage.ts`
  directly.

## Alternatives

- **Share each file with every house member's Google account.** Rejected:
  requires every viewer (not just the uploader) to have Drive connected,
  and moves access control into Drive's sharing model instead of Fylmico's
  own membership checks.
- **Mirror bytes into Supabase Storage as a cache, Drive as source of
  truth.** Rejected: defeats the entire point (Fylmico would still pay
  for storage), and adds a sync-consistency problem for no real benefit
  at this scale.
- **One shared Drive connection per house (e.g. the owner's).** Rejected:
  puts the storage-quota burden entirely on whoever happens to own the
  house, and one revoked/expired connection would break uploads for the
  whole team instead of just that one member.

## Tradeoffs

Benefits:

- Fylmico's storage bill for production files drops to zero - it only
  ever holds small profile avatars.
- Each user's files count against _their own_ Drive quota, which most
  users already have (15GB free tier) - no new storage cost to explain to
  users either.
- `drive.file` scope means Fylmico's OAuth consent screen only asks for
  access to files it creates, not full Drive access - an easier ask than
  it looks and simpler to get past Google's verification requirements.

Costs:

- Every house member who wants to _upload_ must individually connect
  Drive - team members who only view/download others' files don't need
  to. This is a one-time per-user setup cost, same as the original Google
  login connection.
- If a user disconnects Drive (or revokes access from their Google
  Account settings) after uploading files, those `FileEntry` rows become
  undownloadable/undeletable through Fylmico until they reconnect - the
  rows aren't automatically cleaned up, matching how the old Supabase
  rows would also strand if the bucket were deleted out from under them.
- One Google Cloud Console one-time step: the same OAuth client used for
  login needs a second authorized redirect URI added -
  `{app URL}/api/v1/drive/callback` - for both the local dev URL and the
  live Hostinger URL, exactly like `GOOGLE_CALLBACK_URL` was registered
  in ADR 0035/the Hostinger deployment doc.

## Future Implications

- If Fylmico ever wants a "everyone can view without connecting Drive"
  mode, the download-proxy design already supports it for free - only
  _uploaders_ need a connection, viewers never do.
- The same per-user `DriveConnection` + signed-state-redirect pattern is
  reusable if Dropbox/OneDrive support is ever requested - a second
  provider column on the same table, not a schema rewrite.
