# Task: Switch ArticleId To Random and Reconcile Both Ways

## Goal
- Use short random strings for `ArticleId` assignment (not increasing numbers).
- Make `--update-articles` reconcile CSV and articles by `ArticleId` in both directions.

## Spec
- `ArticleId` format
  - assign short random string IDs for newly assigned IDs
  - migrate legacy non-random IDs to random IDs when encountered
  - keep assigned random IDs stable afterward
- `--create-article <row-number>`
  - create article file for that CSV data row
  - assign random `ArticleId`
  - run `--init` after creation
  - error when target row has empty `Title` or already has `ArticleId`
- `--update-articles` reconciliation
  - compare CSV `ArticleId` set vs article metadata `ArticleId` set
  - for each CSV row with `ArticleId`:
    - if matching doc exists: sync doc metadata from CSV and rename file to `Title` when needed
    - if no matching doc: remove that CSV row
  - for each article whose `ArticleId` is not present in CSV: append CSV row from document metadata
  - do not create or delete article files in this phase

## Checklist
- [x] Write plan/spec
- [x] Refactor ID assignment to random strings
- [x] Refactor `--update-articles` to bidirectional reconciliation
- [x] Verify repo behavior
- [x] Verify tmp scenarios for row deletion/appending/rename/sync
- [x] Update lessons and review notes
- [x] Commit

## Review
- Reworked `ArticleId` assignment to short random IDs (`[a-z0-9]{8}`).
- Legacy IDs (including previous increasing numeric IDs) are migrated to random IDs and then preserved.
- `--create-article <row-number>` now assigns random `ArticleId`.
- `--update-articles` now reconciles by `ArticleId` in both directions:
  - CSV row id with matching document -> sync doc metadata from CSV, rename file to `Title` if needed.
  - CSV row id without matching document -> CSV row removed.
  - Document id absent in CSV -> new CSV row appended from document metadata.
  - Rows without `ArticleId` are kept as pending rows.
- Verification:
  - Repo: `npm run blog-index:init` migrated 14 docs to random IDs; CSV reflects random IDs.
  - Repo: `npm run blog-index:update-articles` stable (`updated=0, unchanged=14, csv_removed=0, csv_appended=0`).
  - Tmp reconciliation scenario confirmed rename/sync/remove/append behavior.
  - Tmp create scenario confirmed success with random id, plus error on existing id and empty title.
