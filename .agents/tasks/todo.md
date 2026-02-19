# Task: Normalize Recursive Article Metadata

## Goal
For all markdown files under `database/blog/articles/**`, move visible metadata into YAML frontmatter and assign random unique `ArticleId` values using the agreed format.

## Spec
- Scope: all `.md` files recursively under `database/blog/articles`
- Metadata normalization:
  - if file has no YAML frontmatter, detect top inline metadata block (`Key: Value`) and convert to frontmatter
  - remove converted inline metadata lines from rendered body
  - ensure frontmatter contains `base: "[[blog-index.base]]"` and `ArticleId`
- ArticleId:
  - use short random string (`[a-z0-9]{8}`)
  - keep existing valid random IDs
  - assign new IDs for missing/invalid/duplicate IDs

## Checklist
- [x] Write plan/spec
- [x] Implement normalization
- [x] Verify all markdown files satisfy frontmatter + ArticleId rules
- [x] Update lessons and review notes
- [ ] Commit

## Review
- Added `scripts/normalize-article-metadata.mjs` to normalize recursive markdown metadata under `database/blog/articles/**`.
- Applied normalization to 11 markdown files:
  - Converted inline visible `Key: Value` metadata blocks to YAML frontmatter at top.
  - Removed `notion-id` if present.
  - Enforced `base: "[[blog-index.base]]"`.
  - Assigned random unique `ArticleId` values (`[a-z0-9]{8}`), preserving valid unique IDs when already present.
- Verification:
  - `md_total=11`
  - `starts_with_frontmatter=11`
  - `valid_id_lines=11`
  - `unique_ids=11`
