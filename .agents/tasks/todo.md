# Task: Remove notion-id Metadata Completely

## Goal
Remove `notion-id` from all article frontmatter and prevent the sync script from ever preserving/adding it.

## Spec
- Data migration
  - Remove `notion-id:` line from all `database/blog/articles/*.md`
- Script behavior
  - `--update-articles` must not preserve `notion-id` from existing files
  - New files created by script must not include `notion-id`
- Verification
  - Zero matches for `^notion-id:` across article files
  - Run update command and confirm zero matches remain

## Checklist
- [x] Write plan/spec
- [x] Remove notion-id from all article files
- [x] Patch script to drop notion-id during sync
- [x] Verify end-to-end
- [x] Update lessons and review notes
- [x] Commit

## Review
- Removed `notion-id` frontmatter key from all markdown files in `database/blog/articles`.
- Updated sync logic in `scripts/generate-blog-index-csv.mjs`:
  - `notion-id` is excluded from preserved frontmatter keys.
  - If an existing doc still has `notion-id`, it is treated as a metadata change and rewritten without it.
- Verification:
  - `rg -n '^notion-id:' database/blog/articles/*.md` returned no results.
  - `npm run blog-index:update-articles` completed with stable output (`updated=0, unchanged=14`) and `notion-id` remained absent.
