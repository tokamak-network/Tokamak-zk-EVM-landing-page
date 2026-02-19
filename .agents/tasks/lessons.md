# Lessons

- When suggesting CSV tooling in VS Code, distinguish clearly between syntax-highlighting extensions (e.g., Rainbow CSV) and true table-grid editors (e.g., Edit CSV), and provide command-palette usage steps for the grid workflow.
- In CSV-driven content sync tools, validate required key columns (like `Title`) upfront and fail with row-numbered friendly errors instead of skipping rows silently.
- If CSV is the declared source of truth for a folder, do not scope update/delete to a metadata flag (`base`) that may be missing due to earlier bugs; scan the whole folder and reconcile deterministically.
