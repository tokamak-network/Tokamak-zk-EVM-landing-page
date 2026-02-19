import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "database", "blog");
const ARTICLES_DIR = path.join(BLOG_DIR, "articles");
const OUTPUT_FILE = path.join(BLOG_DIR, "blog-index.csv");

const HEADERS = [
  "Title",
  "AuthorEmail",
  "Slug",
  "CoverImage",
  "PublishDate",
  "CanonicalURL",
  "Status",
  "Author",
  "Tags",
  "ReadTimeMinutes",
  "Description",
  "CoverImageAlt",
  "Published",
];

function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") {
    return null;
  }

  const frontmatter = {};
  let i = 1;
  let currentListKey = null;

  for (; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === "---") {
      break;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentListKey) {
      if (!Array.isArray(frontmatter[currentListKey])) {
        frontmatter[currentListKey] = [];
      }
      frontmatter[currentListKey].push(stripWrappingQuotes(listMatch[1].trim()));
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
    if (!keyMatch) {
      currentListKey = null;
      continue;
    }

    const [, key, rawValue] = keyMatch;
    currentListKey = null;

    if (rawValue === "") {
      frontmatter[key] = "";
      currentListKey = key;
      continue;
    }

    const trimmed = rawValue.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      const body = trimmed.slice(1, -1).trim();
      if (body === "") {
        frontmatter[key] = [];
      } else {
        frontmatter[key] = body
          .split(",")
          .map((value) => stripWrappingQuotes(value.trim()));
      }
      continue;
    }

    frontmatter[key] = stripWrappingQuotes(trimmed);
  }

  return frontmatter;
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function mapToRow(filename, frontmatter) {
  const coverImageValue = Array.isArray(frontmatter.CoverImage)
    ? frontmatter.CoverImage[0] || ""
    : frontmatter.CoverImage || "";

  return {
    Title: filename.replace(/\.md$/i, ""),
    AuthorEmail: frontmatter.AuthorEmail || "",
    Slug: frontmatter.Slug || "",
    CoverImage: coverImageValue,
    PublishDate: frontmatter.PublishDate || "",
    CanonicalURL: frontmatter.CanonicalURL || "",
    Status: frontmatter.Status || "",
    Author: frontmatter.Author || "",
    Tags: Array.isArray(frontmatter.Tags)
      ? frontmatter.Tags.join("; ")
      : frontmatter.Tags || "",
    ReadTimeMinutes: frontmatter.ReadTimeMinutes || "",
    Description: frontmatter.Description || "",
    CoverImageAlt: frontmatter.CoverImageAlt || "",
    Published: frontmatter.Published || "",
  };
}

function generateCsv() {
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((name) => name.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  const rows = [];
  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) {
      continue;
    }

    if (frontmatter.base !== "[[blog-index.base]]") {
      continue;
    }

    rows.push(mapToRow(file, frontmatter));
  }

  const outputLines = [
    HEADERS.join(","),
    ...rows.map((row) => HEADERS.map((header) => csvEscape(row[header])).join(",")),
  ];

  fs.writeFileSync(OUTPUT_FILE, `${outputLines.join("\n")}\n`, "utf8");
  console.log(`Generated ${OUTPUT_FILE} (${rows.length} rows)`);
}

generateCsv();
