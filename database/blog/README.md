# Blog Index CLI Guide

The `database/blog` workflow uses a CLI to keep `blog-index.base`, `blog-index.csv`, and `articles` in sync.

## 1) Commands

Primary entry point:

```bash
npm run blog-index -- <option>
```

You can also use the existing aliases:

```bash
npm run blog-index:init
npm run blog-index:update-articles
npm run blog-index:create-article -- 12
```

## 2) Recommended Workflow

1. `npm run blog-index:init`
2. Edit `blog-index.csv`
3. If you need a new article file, run `npm run blog-index:create-article <csv-row-index>`
4. Run `npm run blog-index:update-articles` to re-sync everything


## 3) Examples
### Creating a new article
There are two ways to create a new article:

- Approach 1: Create a markdown file under `articles/`, then run `npm run blog-index:update-articles`. Confirm that a new row is added to `blog-index.csv`.

- Approach 2: Add a new row to `blog-index.csv` and fill in `Title`.  
  Example: if the new row is on line 5, run `npm run blog-index:create-article -- 5`.  
  Confirm that a new folder is created under `articles/`.

### Modifying article metadata
*Never edit metadata directly inside markdown files.*

Edit metadata in `blog-index.csv`, then run `npm run blog-index:update-articles`.

### Deleting an article
Delete the markdown file and its parent folder from `articles/`, then run `npm run blog-index:update-articles`.

## 4) What Each Option Does

### `--init`

Rebuilds `blog-index.csv` from current article files under `articles/` and `blog-index.base`, then normalizes article IDs and file layout.

Usage:
```bash
npm run blog-index:init
```
### `--create-article <csv-row-number>`

Creates a new markdown article file from one CSV row.

Required for that row:
- `Title` must exist.
- `ArticleId` must be empty.

Output path:
`database/blog/articles/<ArticleId>/<Title>.md`

Usage:
```bash
# Suppose row 12 has a non-empty Title and an empty ArticleId.
npm run blog-index -- --create-article 12
```
### `--update-articles`

Makes CSV and article files match by `ArticleId`.

In short:
- Bad or unmatched CSV rows are removed.
- Missing CSV rows are added from existing article files.
- Matched articles get metadata updates from CSV.
- If filename and frontmatter `Title` conflict, `Title` wins.

Usage:
```bash
npm run blog-index:update-articles
```

## 5) Storage Rules

- Article directory: `database/blog/articles/<ArticleId>/`
- Markdown file name: `<Title>.md`
- Required frontmatter behavior:
- `ArticleId` is required.
- `Title` is required and has higher priority than filename.
- `base: "[[blog-index.base]]"` is enforced.

