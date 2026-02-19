# Lessons

- When suggesting CSV tooling in VS Code, distinguish clearly between syntax-highlighting extensions (e.g., Rainbow CSV) and true table-grid editors (e.g., Edit CSV), and provide command-palette usage steps for the grid workflow.
- In CSV-driven content sync tools, validate required key columns (like `Title`) upfront and fail with row-numbered friendly errors instead of skipping rows silently.
- If CSV is the declared source of truth for a folder, do not scope update/delete to a metadata flag (`base`) that may be missing due to earlier bugs; scan the whole folder and reconcile deterministically.
- When users require a metadata key to be removed permanently, handle both migration (bulk remove existing files) and enforcement (script must strip the key even when no other metadata changed).
- If creation has a dedicated command, update/sync commands must not silently create new files; they should hard-fail with actionable guidance.
- When a user specifies an explicit reconciliation algorithm, implement that exact directionality (CSV->docs, docs->CSV, deletions/appends) instead of preserving previous source-of-truth assumptions.
- For archive extraction requests, never extract multiple archives into a shared destination when internal top-level folder names can collide; always isolate per-archive output first.
- To keep metadata hidden in rendered markdown, normalize files to YAML frontmatter at the very top (`--- ... ---`) instead of leaving `Key: Value` lines in body content.
- For article sync, when markdown filename and frontmatter `Title` conflict, treat frontmatter `Title` as canonical and rename the file to match it instead of overwriting metadata from filename.
- In `--update-articles`, do not keep CSV rows with empty `ArticleId`; remove them so CSV remains a strict mirror of existing article documents.
- For `--create-article`, interpret the user-provided index as the actual CSV line number (header included), so first data row starts at index 2.
