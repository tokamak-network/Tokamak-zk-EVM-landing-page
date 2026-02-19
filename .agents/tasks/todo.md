# Task: Fix Full-Folder Sync Boundary

## Goal
Ensure `--update-articles` uses CSV as source of truth for the entire `database/blog/articles` folder, so legacy files without `base` do not get skipped or left behind.

## Spec
- Matching scope
  - Include all `articles/*.md` files for match/update/delete decisions
  - Not limited by existing `base` value
- Sync behavior
  - Keep filename = CSV `Title` sync guarantees
  - Keep strict `Title` validations
  - Keep rename-by-`Slug` behavior and preserve body
  - Delete files not represented by CSV title rows

## Checklist
- [x] Write plan/spec
- [x] Implement sync-boundary fix
- [x] Verify in repo (legacy missing-base file resolved)
- [x] Verify in tmp integration scenario
- [x] Update lessons and review notes
- [x] Commit

## Review
- Fixed `--update-articles` matching scope to include all `database/blog/articles/*.md` files, not just files that already had `base: [[blog-index.base]]`.
- Outcome:
  - Legacy files missing `base` are now corrected when represented in CSV.
  - Files not represented by CSV are deleted, regardless of prior `base` state.
- Verification:
  - In-repo run: orphan file `database/blog/articles/zk-EVM (Ooo) Blogs New item.md` was removed during sync; subsequent run stable with `deleted=0`.
  - Tmp integration:
    - Legacy file without `base` + CSV row matching its title/slug -> updated with `base` and metadata, body preserved.
    - Extra file not in CSV -> deleted (`deleted=1`).
