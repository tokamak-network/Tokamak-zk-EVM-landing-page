# Task: Blog Index All-in-One Script

## Goal
Implement one script that:
- creates `database/blog/blog-index.csv` from `database/blog/blog-index.base` (`--init`)
- syncs `database/blog/articles/*.md` from CSV as source of truth (`--update-articles`)

## Spec
- `--init`
  - Read columns/order from `database/blog/blog-index.base`
  - Scan `database/blog/articles/*.md`
  - Include only documents with frontmatter `base: "[[blog-index.base]]"`
  - Generate `database/blog/blog-index.csv`
- `--update-articles`
  - Read `database/blog/blog-index.csv`
  - For each CSV row:
    - Find/create article file by `Title` -> `<Title>.md`
    - Update frontmatter fields from CSV
    - Ensure `base: "[[blog-index.base]]"`
    - Preserve body content for existing docs
    - New docs should include frontmatter + placeholder body
  - Delete managed article docs (`base: "[[blog-index.base]]"`) not present in CSV titles
- CLI behavior
  - Exactly one mode required: `--init` or `--update-articles`
  - Friendly summary output with counts

## Checklist
- [x] Write plan/spec
- [x] Implement script
- [x] Wire npm scripts
- [x] Verify `--init`
- [x] Verify `--update-articles`
- [x] Add review notes
- [x] Commit

## Review
- Implemented all-in-one CLI in `scripts/generate-blog-index-csv.mjs`:
  - `--init`: reads columns/order from `database/blog/blog-index.base` and generates `database/blog/blog-index.csv`
  - `--update-articles`: applies CSV as source of truth to `database/blog/articles/*.md` (create/update/delete)
- Added npm commands:
  - `blog-index:init`
  - `blog-index:update-articles`
  - kept `generate-blog-index-csv` as compatibility alias to `--init`
- Verification:
  - In-repo check:
    - `npm run blog-index:init` -> generated 14 rows
    - `npm run blog-index:update-articles` -> `created=0, updated=0, unchanged=14, deleted=0`
  - Integration check in `/tmp`:
    - CSV with one existing row changed + one new row + one row removed
    - Result -> `created=1, updated=1, deleted=1` and preserved body for updated file
