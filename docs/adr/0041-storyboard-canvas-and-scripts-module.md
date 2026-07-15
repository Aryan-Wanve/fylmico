# 0041: Storyboard Drawing Canvas and Scripts Module

Date: 2026-07-12

Status: Accepted

## Problem

Storyboard only tracked structured metadata for boards/shots/characters/
locations - there was no way to actually sketch a shot, only describe it in
fields. There was also no Scripts module at all - houses had no place to
write or store an actual screenplay, despite Storyboard shots already
implying an underlying script (a shot is a visual beat of some scene, but
that scene's text lived nowhere in the product).

## Decision

Add a real drawing/editing canvas for storyboard shots, and a new, separate
Scripts (screenplay) module, with a lightweight cross-link between a
storyboard Board and a Script.

- **The canvas is plain HTML5 `<canvas>` freehand drawing, stored as a
  raster image, not vector data.** `DrawingCanvasDialog` renders a fixed
  640x360 `<canvas>`, draws strokes on `pointerdown`/`pointermove` with
  `ctx.lineTo`/`ctx.stroke` (color from a small fixed swatch list, a pen/
  eraser toggle where the eraser is just stroking in the canvas's own
  white background color, and an adjustable line width), and on save
  calls `canvas.toDataURL("image/png")` - a base64 PNG data URL is what
  gets handed back to the caller (`onSave(dataUrl)`) and presumably
  persisted as the shot's image field. There is no stroke-list/undo-
  history data structure kept - once "Save Drawing" is clicked, only the
  flattened pixels survive; re-opening the dialog on an existing shot
  loads that PNG back into the canvas as a starting image
  (`ensureCanvasReady` draws the `initialImageUrl` into the canvas via a
  plain `Image`/`ctx.drawImage`) and further strokes draw on top of it.
- **New `Script` model**, scoped to a house (`organizationId`, cascade
  delete) with an optional `projectId` (`SetNull` on project delete) and
  `createdById`. Content is a single `content` string field (default
  `""`) - no structured scene/element breakdown is stored server-side;
  the screenplay is treated as one blob of text per script, same as a
  plain-text document.
  Migration `20260712160000_scripts` also adds a nullable `script_id` on
  `boards` (`SetNull` on delete) - a Board can optionally point at one
  Script, but a Script isn't owned by a single Board (a script can exist,
  or be linked from multiple boards' perspective conceptually, without
  the reverse relation being enforced at the DB level beyond that one
  FK).
- **Scripts is a sibling module, not a Storyboard sub-feature.**
  `scripts.service.ts` is its own service (`list`/`get`/`create`/`update`/
  `delete`, all gated by `organizationsService.requireMembership` - any
  house member, not just Owners) with its own route handlers under
  `houses/[houseId]/scripts`, its own page (`scripts-page.tsx`) and nav
  entry, independent of Storyboard's boards/shots CRUD. The only coupling
  point is one-directional and read-only from Storyboard's side:
  `LinkedScriptPanel` (rendered inside a Storyboard board's view) shows
  the linked script's title and a scrollable read-only preview of its
  `content`, with an "Open in Scripts" link that navigates to `/scripts`
  - it does not let you edit the script from inside Storyboard.
- **Screenplay formatting is a client-side text convention, not a rich
  document format.** `ScriptFormatToolbar` (added in a follow-up commit,
  `80d5fef`) offers six standard screenplay elements (Scene Heading,
  Action, Character, Dialogue, Parenthetical, Transition) as buttons; each
  applies plain-text conventions to the current line via
  `formatScriptLine` - fixed-width space indentation per element type
  (0/10/15/20 spaces) and case rules (scene headings/character/transition
  uppercased, scene headings prefixed with `INT.`/`EXT.` if missing,
  parentheticals wrapped in literal `(`/`)`). The persisted `content`
  field is still just a plain string with these spaces/casing baked in -
  there's no per-line "type" metadata stored, so the formatting is purely
  a typing aid, not a structured document model a renderer could later
  re-flow.

## Alternatives

- **Store the drawing as vector strokes (points/colors/widths as JSON)
  instead of a flattened PNG.** Rejected for this pass: vector storage
  would allow true non-destructive re-editing (move/undo individual
  strokes later) but requires a custom renderer wherever the drawing is
  displayed (thumbnails, exports, PDFs); a PNG data URL is already
  directly usable anywhere an image URL is expected (the same field a
  shot's static reference image would have used) with zero new rendering
  code.
- **Fold Scripts into Storyboard as a tab/field on a Board** rather than a
  standalone module. Rejected: a script is meaningfully reusable/
  referenceable independent of any one board (a house may have scripts in
  progress before storyboarding starts, or a script relevant to multiple
  boards over a production's life), and giving it its own list/detail
  page and nav entry matches how the product already treats other cross-
  cutting entities (Projects, Clients) rather than nesting it one level
  inside a single other feature.
- **A structured screenplay data model** (scene/character/dialogue as
  distinct typed elements, like Final Draft's FDX format) instead of a
  plain string with typed formatting applied client-side. Rejected as
  premature for this pass - the simpler plain-text-with-conventions
  approach ships a usable editor immediately; a structured model is a
  bigger schema and editor rewrite that can follow once real usage shows
  it's needed (e.g. for PDF export or scene-level linking).

## Tradeoffs

Benefits:

- The canvas required no new dependency - plain `<canvas>` 2D context
  APIs already available in every browser, no charting/drawing library
  pulled in.
- A base64 PNG data URL slots into whatever image-URL field a shot
  already had, so no new storage plumbing (Drive-backed or otherwise, per
  ADR 0038) was needed specifically for drawings beyond what already
  existed for shot images.
- Scripts as an independent module means it can grow its own feature set
  (versioning, collaboration, export) later without being tangled into
  Storyboard's data model.

Costs:

- Flattening to a PNG on save means no non-destructive editing - a user
  can't undo a stroke from three saves ago, only draw over it. Acceptable
  for a first cut of "sketch this shot," not for a serious illustration
  tool.
- The formatting toolbar's conventions (indentation via literal spaces,
  case transforms) are baked directly into the stored `content` string -
  if a future structured-screenplay model is introduced, migrating this
  free-text convention into real per-line typed elements is a manual,
  lossy-ish parsing exercise (inferring element type from indentation/
  case rather than reading it directly).
- `Script.content` has no size cap and no versioning/history - a
  concurrent-edit or accidental-overwrite scenario (two tabs editing the
  same script) has no conflict detection.

## Future Implications

- If drawings need non-destructive editing later, the canvas would need
  to move to a stroke-list representation (undo stack, replay) - a
  frontend-only rewrite of `DrawingCanvasDialog`, no schema change
  required since the final output could still be flattened to the same
  image field for display.
- A structured screenplay model (typed scene/dialogue elements, PDF/FDX
  export) is the natural next step for Scripts if usage grows - the
  current `formatScriptLine` conventions are a reasonable de facto
  parsing spec to build that structured model against later.
- The one-directional `Board.scriptId` link could grow a reverse view
  (e.g. "boards using this script" on the Script detail page) without a
  schema change, since the FK already exists.
- Commits: `58376e3` (canvas + Scripts module), `80d5fef` (formatting
  toolbar).
