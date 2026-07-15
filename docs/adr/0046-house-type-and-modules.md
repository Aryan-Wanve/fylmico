# 0046: House Type Step + Per-Type Default Modules

Date: 2026-07-15

Status: Accepted

## Problem

Every house got the exact same fixed role/conversation seed and the exact
same static 13-item sidebar (`nav-items.ts`), regardless of who's using
it. A solo freelancer saw Crew Management and House Chat; a student film
club saw Bookings/Call Sheets built for a full production company. There
was no house-identity step at all, and no concept anywhere in the schema
of per-house feature toggles.

## Decision

- **A new "Choose House Type" step before House Information.**
  `house-choice-card.tsx` gains a `"create-type"` mode between `"choice"`
  and `"create"`: 5 options (Freelancer/Solo, Agency/Production House,
  College Club/Group, Hobbyists, Custom), reusing the existing
  `HouseChoiceRow` component exactly as the 3 top-level choice rows
  already do - lucide icons (`User`/`Building2`/`GraduationCap`/`Heart`/
  `Settings2`), not literal emoji, matching this screen's existing
  aesthetic. Selecting a type stores it in local state and moves to
  `"create"`; that screen's Back button now returns to `"create-type"`
  instead of `"choice"`, since that's the immediately-prior step.
- **`Organization` gains `type` and `enabledModules`** (`type String
@default("custom")`, `enabledModules String[] @default([])`). Existing
  houses were backfilled with `type: "custom"` and every module id, so no
  house silently lost a nav item it already used.
- **One shared, plain data source of truth**: `apps/web/src/lib/house-types.ts`
  exports `HOUSE_TYPES`, `HOUSE_TYPE_INFO` (label/description per type),
  `ALL_MODULE_IDS` (mirrors `nav-items.ts`'s ids - kept separate since
  `nav-items.ts` imports `lucide-react` icons and isn't safe to import
  from a server route), `HOUSE_TYPE_DEFAULT_MODULES`, and
  `ALWAYS_ENABLED_MODULES` (`["home", "settings"]`). Imported by both
  `organizations.service.ts` (server) and the House Type step / sidebar /
  Settings toggle (client) - no duplicated module lists.
- **Default module sets per type** (judgment calls, all editable
  afterward - see below): Freelancer excludes Crews/Messages/Call
  Sheets/Announcements (no team to manage or coordinate with); Agency and
  Custom enable everything; College excludes Bookings/Call Sheets/
  Analytics (collaborative but casual, no formal resource-booking or
  reporting needs); Hobbyist keeps the smallest set (adds Messages to
  Freelancer's list, drops Bookings/Analytics too - the most casual tier).
- **`home` and `settings` are always visible**, in every type, and are
  never toggleable from Settings - excluding them from `AppSidebar`'s
  filter and from the Settings toggle list entirely, since a house should
  never be able to toggle away its own way back into Settings.
- **Toggling modules is Owner-only.** `UpdateHouseDto.enabledModules` is
  checked via `requireOwnerRole` inside `updateHouse` (the same guard
  Drive connect/disconnect and `removeMember` already use, ADR 0045) -
  name/handle/description stay member-editable, unchanged. The Settings
  UI hides the "Modules" card entirely for non-Owners (mirrors the
  `isOwner` check already used in `announcements-page.tsx`), reusing the
  exact `Switch` + row pattern from `notifications-section.tsx`.

## Alternatives

- **A relational `HouseModule` table** instead of a plain `String[]`
  column. Rejected: 14 fixed, well-known module ids with no per-module
  metadata beyond on/off - a join table would be pure overhead for what a
  string array already models correctly.
- **Locking modules permanently to the chosen type.** Rejected per the
  explicit ask - type only sets sensible defaults; every module stays
  independently toggleable from House Settings afterward.
- **Gating routes/API responses server-side by `enabledModules`, not just
  hiding sidebar links.** Deferred - see Future Implications.

## Tradeoffs

Benefits:

- Every house feels tailored from creation without any extra setup step
  beyond picking one of 5 cards.
- Single source of truth for the module list and defaults means the
  sidebar, the toggle UI, and the create-time defaults can never drift
  from each other.

Costs:

- Default module sets are product judgment calls, not something the user
  specified module-by-module - reasonable to revisit per type once real
  usage patterns are seen.
- Disabling a module only hides its sidebar link; the underlying route
  and API endpoints remain fully reachable by URL/direct request. Scoped
  out of this pass - see Future Implications.

## Future Implications

- If a disabled module needs to be actually blocked (not just hidden),
  the natural next step is a light per-route check in `AppShellGate`
  (redirect if the route's module isn't in `activeHouse.enabledModules`)
  and, if API-level enforcement is ever needed, a check inside each
  domain's service methods - deferred here since hiding the nav entry
  covers the actual product ask (a tailored workspace, not access
  control).
- `HOUSE_TYPE_DEFAULT_MODULES` is a single object literal - trivial to
  tune per type without any migration if the defaults turn out wrong.
