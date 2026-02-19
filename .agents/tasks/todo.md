# Task: Add Immutable ArticleId and create-article Command

## Goal
Add immutable unique IDs to all articles and split document creation from update flow.

## Spec
- Schema
  - Add `ArticleId` property to `database/blog/blog-index.base`
  - Include `ArticleId` in table order
- Metadata
  - Every article frontmatter includes `ArticleId`
  - Existing docs without `ArticleId` get assigned sequential IDs once
- CLI
  - Add `--create-article <row-number>`:
    - Creates a new document for the target CSV data row
    - Assigns a new `ArticleId`
    - Re-runs `--init` to regenerate CSV
    - Errors when target row has empty `Title` or already has `ArticleId`
  - `--update-articles` no longer creates new documents
    - It must error if CSV row references non-existing `ArticleId`

## Checklist
- [x] Write plan/spec
- [x] Update base schema (`ArticleId`)
- [x] Implement immutable ID logic in script
- [x] Implement `--create-article <row-number>`
- [x] Remove document-creation path from `--update-articles`
- [x] Migrate existing docs to include `ArticleId`
- [x] Verify end-to-end (repo + tmp scenarios)
- [x] Update lessons and review notes
- [ ] Commit

## Review
- `scripts/generate-blog-index-csv.mjs` rewritten to support three modes:
  - `--init`
  - `--update-articles`
  - `--create-article <row-number>`
- `ArticleId` is now required in schema and treated as immutable key during update.
- `--create-article` behavior:
  - accepts 1-based CSV data row index (header excluded)
  - validates title present and id empty
  - creates file + assigns next available `ArticleId`
  - runs `init` afterward to regenerate CSV from articles
- `--update-articles` behavior:
  - validates all rows have `Title` and `ArticleId`
  - updates/renames/deletes only; no creation
  - errors if row `ArticleId` cannot be matched to a file
- Repo verification:
  - `npm run blog-index:init` -> CSV now includes `ArticleId`; all 14 docs got IDs
  - `npm run blog-index:update-articles` -> stable (`created=0, updated=0, unchanged=14, renamed=0, deleted=0`)
- Tmp verification:
  - `--update-articles` fails when row has empty `ArticleId` with friendly guidance
  - `--create-article 2` creates file, assigns new id, and re-inits CSV
  - `--create-article` fails if row already has `ArticleId`
  - `--create-article` fails if target row `Title` is empty
