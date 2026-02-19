# Task: Re-extract ZIPs Into Isolated Random Folders

## Goal
Avoid name collisions by extracting each ZIP archive into its own arbitrary folder and recursively extracting nested ZIPs inside that isolated folder.

## Spec
- Target: `database/blog/articles/*.zip` (root-level zip files)
- For each zip:
  - create unique random output folder (`pkg_<random>`)
  - extract archive into that folder
  - recursively extract nested zip files inside the same folder
  - remove nested zip files after extraction
- Keep original root zip files in place unless explicitly asked to delete

## Checklist
- [x] Write plan/spec
- [x] Implement isolated recursive extraction
- [x] Verify each zip produced its own random folder
- [x] Update lessons and review notes
- [ ] Commit

## Review
- Isolated extraction completed for each root ZIP under `database/blog/articles` into unique folders:
  - `pkg_705d35b7b2`
  - `pkg_9c18dc46c1`
  - `pkg_b81e83e02c`
  - `pkg_4c0319dee7`
  - `pkg_ee5fbcecd2`
  - `pkg_f47c1cc85f`
- Nested ZIP files were recursively extracted inside each isolated folder and then removed.
- Verified no ZIP remains inside `pkg_*` folders (`count=0`).
- Mapping file generated: `database/blog/articles/_extract_map.txt`.
