# Task: Strengthen CSV -> Articles Sync

## Goal
Improve `--update-articles` so that:
- document filename is always synced to CSV `Title`
- CSV rows with empty `Title` fail fast with friendly error
- title changes keep existing article body when possible

## Spec
- Validation
  - If any data row has empty `Title`, stop and show row number(s)
  - If duplicate `Title` exists, stop with clear error
  - If `Title` contains path separators (`/`, `\`), stop with clear error
- Sync behavior
  - Match existing managed docs by `Title` first
  - If `Title` changed, match by `Slug` and rename file to new title
  - Preserve article body and unmanaged frontmatter keys on update
  - Keep create/update/delete behavior based on CSV as source of truth

## Checklist
- [x] Write plan/spec
- [x] Implement script changes
- [x] Verify normal update flow
- [x] Verify rename sync flow
- [x] Verify blank title error flow
- [x] Update lessons and review notes
- [ ] Commit

## Review
- Implemented stricter CSV validation in `--update-articles`:
  - Empty `Title` now fails fast with row numbers and clear message
  - Duplicate `Title` now fails fast
  - `Title` containing path separators (`/`, `\`) now fails fast
- Improved filename synchronization:
  - Existing managed docs are matched by `Title` first, then by `Slug`
  - If matched by `Slug` with changed `Title`, file is renamed to `<Title>.md` and body is preserved
  - Output now includes `renamed` count
- Added friendly top-level error handling to avoid stack traces for user-facing CLI errors
- Verification:
  - `npm run blog-index:update-articles` in repo -> `created=0, updated=0, unchanged=14, renamed=0, deleted=0`
  - `/tmp` rename scenario -> `created=0, updated=1, renamed=1` and body preserved
  - `/tmp` empty title scenario -> exits with `Error: CSV has empty Title value on line(s): ...`
