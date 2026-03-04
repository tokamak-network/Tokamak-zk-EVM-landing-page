# Blog Migration Handover: Notion → Local Database

**Date:** March 4, 2026  
**Branch:** `fix/blog-displayed`  
**Commit:** `8596216` — `fix: blog displayed`

---

## What Changed

The blog system was migrated from fetching posts via the **Notion API** to reading from the **local `database/blog/` directory** (CSV index + markdown article files).

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/blog.ts` | **Rewritten.** No longer imports or calls Notion. Reads `database/blog/blog-index.csv` for post metadata and `database/blog/articles/<ArticleId>/*.md` for markdown content. |
| `src/types/blog.ts` | Added `markdownContent?: string` field to `BlogPost`. `recordMap` kept for backward compatibility but is no longer populated. |
| `src/components/MarkdownContent.tsx` | **New file.** Renders markdown using `react-markdown` with `remark-gfm` (tables, strikethrough), `remark-math` + `rehype-katex` (LaTeX math). Styled to match the site's dark theme. |
| `src/components/BlogList.tsx` | Blog card thumbnails now always show the title + branded background. Cover images are no longer displayed. |
| `src/app/blog/[slug]/page.tsx` | Replaced `NotionContent` with `MarkdownContent`. Updated word count estimation to use markdown text instead of Notion `recordMap`. |
| `src/lib/process-blog-post.ts` | Visualization text extraction now reads from `post.markdownContent` instead of Notion `recordMap`. Removed `extractTextFromNotionContent` import. |
| `package.json` | Added `remark-math` and `rehype-katex` dependencies. |

---

## How the Blog Works Now

### Data Source

```
database/blog/
├── blog-index.csv          ← Single source of truth for all post metadata
├── blog-index.base         ← Schema definition (for Obsidian workflow)
├── articles/
│   ├── <ArticleId>/
│   │   └── <Title>.md      ← Markdown article with YAML frontmatter
│   ├── cuyrwc2b/
│   │   └── Delegating Computations of Multi-Scalar Multiplication.md
│   └── ...
└── README.md               ← CLI guide for managing blog content
```

### Data Flow

1. `getBlogPosts()` — Parses `blog-index.csv`, filters by `BLOG_ENVIRONMENT` (`Prod` or `Staging`), returns metadata only.
2. `getBlogPostBySlug(slug)` — Finds the post in CSV, then reads the corresponding markdown file from `articles/<ArticleId>/`, strips frontmatter, and returns `markdownContent`.
3. Blog listing page (`/blog`) calls `getBlogPosts()` and renders `BlogList`.
4. Blog post page (`/blog/[slug]`) calls `getBlogPostBySlug()` and renders `MarkdownContent`.

### Environment Filtering

- `BLOG_ENVIRONMENT=prod` → Only shows posts where `Published` column = `Prod`
- `BLOG_ENVIRONMENT=staging` (default) → Shows both `Prod` and `Staging` posts

### CSV Columns Used

`Title`, `ArticleId`, `Slug`, `Description`, `Published`, `PublishDate`, `Tags` (semicolon-separated), `Author`, `AuthorEmail`, `CoverImage`

---

## Adding / Editing Blog Posts

Follow the workflow in `database/blog/README.md`:

1. **New post:** Add a markdown file under `articles/`, then run `npm run blog-index:update-articles` — or add a row to the CSV and run `npm run blog-index:create-article -- <row>`.
2. **Edit metadata:** Edit `blog-index.csv`, then run `npm run blog-index:update-articles`.
3. **Delete a post:** Remove the article folder from `articles/`, then run `npm run blog-index:update-articles`.

**Never edit metadata directly inside markdown frontmatter.** Always edit `blog-index.csv` first.

---

## Images

- Article images referenced in markdown use Notion-export-style relative paths. These files **do not exist** in the repo.
- The `MarkdownContent` component detects non-HTTP image URLs and shows a branded placeholder (grid background + "TOKAMAK zk-EVM" branding + alt text) instead of broken images.
- Remote (HTTP/HTTPS) images load normally; if they fail, the same placeholder appears via `onError`.
- Blog card thumbnails always show the title + background placeholder — no cover images are displayed.

---

## What Is No Longer Used

These files/packages are **still in the codebase** but no longer called by the blog system:

| Item | Status |
|------|--------|
| `src/lib/notion.ts` | Not imported by blog anymore. May still be used elsewhere — verify before removing. |
| `src/components/NotionContent.tsx` | Not imported anywhere in the blog flow. Safe to delete if no other pages use it. |
| `@notionhq/client`, `notion-client`, `react-notion-x`, `notion-types` | No longer needed for the blog. Check if any other feature depends on them before uninstalling. |
| `NOTION_API_KEY`, `NOTION_DATABASE_ID` env vars | Not needed for blog. May be needed by other features. |

---

## Consumers of Blog Functions

All of these import from `@/lib/blog` and work without changes (they only use metadata, not content):

- `src/app/blog/page.tsx` — Blog listing
- `src/app/blog/[slug]/page.tsx` — Single post
- `src/app/blog/[slug]/opengraph-image.tsx` — Dynamic OG image
- `src/app/blog/[slug]/twitter-image.tsx` — Dynamic Twitter card
- `src/app/sitemap.ts` — Sitemap generation
- `src/app/api/knowledge/route.ts` — Knowledge API for LLM SEO
- `src/app/api/check-new-posts/route.ts` — Cron job for visualization generation

---

## Dependencies Added

```
remark-math    — Parses $...$ and $$...$$ math syntax in markdown
rehype-katex   — Renders parsed math as KaTeX HTML
```

Already present and reused: `react-markdown`, `remark-gfm`, `katex`.
