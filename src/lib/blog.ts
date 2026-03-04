import fs from "fs";
import path from "path";
import { BlogPost } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "database", "blog");
const ARTICLES_DIR = path.join(BLOG_DIR, "articles");
const CSV_PATH = path.join(BLOG_DIR, "blog-index.csv");

const BLOG_ENVIRONMENT =
  process.env.BLOG_ENVIRONMENT?.toLowerCase() === "prod" ? "Prod" : "Staging";

/**
 * Parse a CSV line respecting quoted fields that may contain commas.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parse YAML frontmatter from a markdown string.
 * Returns { metadata, content } where content is the body after the closing ---.
 */
function parseFrontmatter(raw: string): {
  metadata: Record<string, string | string[]>;
  content: string;
} {
  const metadata: Record<string, string | string[]> = {};

  if (!raw.startsWith("---")) {
    return { metadata, content: raw };
  }

  const endIdx = raw.indexOf("\n---", 3);
  if (endIdx === -1) {
    return { metadata, content: raw };
  }

  const frontmatterBlock = raw.slice(4, endIdx);
  const content = raw.slice(endIdx + 4).trim();

  let currentKey = "";
  let inList = false;
  const listItems: string[] = [];

  for (const line of frontmatterBlock.split("\n")) {
    const trimmed = line.trim();

    if (inList) {
      if (trimmed.startsWith("- ")) {
        listItems.push(trimmed.slice(2).replace(/^"(.*)"$/, "$1"));
        continue;
      } else {
        metadata[currentKey] = [...listItems];
        listItems.length = 0;
        inList = false;
      }
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    if (value === "") {
      currentKey = key;
      inList = true;
      continue;
    }

    value = value.replace(/^"(.*)"$/, "$1");
    metadata[key] = value;
  }

  if (inList && listItems.length > 0) {
    metadata[currentKey] = [...listItems];
  }

  return { metadata, content };
}

/**
 * Read and parse the blog-index.csv into an array of BlogPost metadata.
 */
function readBlogIndex(): BlogPost[] {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("[BLOG] blog-index.csv not found at", CSV_PATH);
    return [];
  }

  const csvText = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = csvText.split("\n").filter((l) => l.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);

  const col = (name: string) => headers.indexOf(name);
  const titleIdx = col("Title");
  const articleIdIdx = col("ArticleId");
  const slugIdx = col("Slug");
  const descIdx = col("Description");
  const publishedIdx = col("Published");
  const publishDateIdx = col("PublishDate");
  const tagsIdx = col("Tags");
  const coverImageIdx = col("CoverImage");
  const authorIdx = col("Author");
  const authorEmailIdx = col("AuthorEmail");

  const posts: BlogPost[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    const get = (idx: number) => (idx >= 0 && idx < fields.length ? fields[idx] : "");

    const articleId = get(articleIdIdx);
    const slug = get(slugIdx);
    const published = get(publishedIdx);

    if (!articleId || !slug) continue;

    const tagsRaw = get(tagsIdx);
    const tags = tagsRaw
      ? tagsRaw
          .split(";")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const coverImageRaw = get(coverImageIdx);
    let coverImage = "";
    if (coverImageRaw) {
      coverImage = `/blog-assets/${articleId}/${decodeURIComponent(coverImageRaw)}`;
    }

    posts.push({
      id: articleId,
      title: get(titleIdx) || "Untitled",
      slug,
      description: get(descIdx) || "",
      published: published || "Staging",
      publishDate: get(publishDateIdx) || new Date().toISOString(),
      tags,
      coverImage,
      author: get(authorIdx) || "Tokamak Network",
      authorEmail: get(authorEmailIdx) || undefined,
    });
  }

  return posts;
}

/**
 * Read markdown content for a given articleId from the articles directory.
 */
function readArticleMarkdown(articleId: string): string | null {
  const articleDir = path.join(ARTICLES_DIR, articleId);
  if (!fs.existsSync(articleDir)) return null;

  const files = fs.readdirSync(articleDir).filter((f) => f.endsWith(".md"));
  if (files.length === 0) return null;

  const filePath = path.join(articleDir, files[0]);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { content } = parseFrontmatter(raw);
  return content;
}

/**
 * Fetch all published blog posts from database/blog/.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const allPosts = readBlogIndex();

  const filtered =
    BLOG_ENVIRONMENT === "Prod"
      ? allPosts.filter((p) => p.published === "Prod")
      : allPosts.filter((p) => p.published === "Prod" || p.published === "Staging");

  filtered.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  return filtered;
}

/**
 * Fetch a single blog post by slug with full markdown content.
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = readBlogIndex();
  const post = allPosts.find(
    (p) =>
      p.slug === slug &&
      (BLOG_ENVIRONMENT === "Prod"
        ? p.published === "Prod"
        : p.published === "Prod" || p.published === "Staging")
  );

  if (!post) return null;

  const markdown = readArticleMarkdown(post.id);
  if (markdown) {
    post.markdownContent = markdown;
  }

  return post;
}

/**
 * Get all slugs for static generation.
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await getBlogPosts();
  return posts.map((p) => p.slug).filter(Boolean);
}

/**
 * Fetch recent blog posts (for homepage or sidebar).
 */
export async function getRecentBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.slice(0, limit);
}

/**
 * Fetch blog posts filtered by tag.
 */
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((post) =>
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}
