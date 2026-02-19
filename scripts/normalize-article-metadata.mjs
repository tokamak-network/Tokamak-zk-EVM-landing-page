import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const ROOT_DIR = process.cwd();
const ARTICLES_DIR = path.join(ROOT_DIR, "database", "blog", "articles");
const BASE_LINK = "[[blog-index.base]]";

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const ID_LENGTH = 8;
const ID_REGEX = /^[a-z0-9]{8}$/;

const KNOWN_META_KEYS = new Set([
  "base",
  "ArticleId",
  "Title",
  "Slug",
  "Description",
  "Published",
  "PublishDate",
  "Tags",
  "Author",
  "AuthorEmail",
  "CanonicalURL",
  "CoverImage",
  "ReadTimeMinutes",
  "Status",
  "CoverImageAlt",
]);

const ORDERED_KEYS = [
  "base",
  "ArticleId",
  "Title",
  "Slug",
  "Description",
  "Published",
  "PublishDate",
  "Tags",
  "Author",
  "AuthorEmail",
  "CanonicalURL",
  "CoverImage",
  "ReadTimeMinutes",
  "Status",
  "CoverImageAlt",
];

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function normalizeScalar(value) {
  return value == null ? "" : String(value).trim();
}

function preferredTitle(fileTitle, metadataTitle) {
  const fromMeta = normalizeScalar(metadataTitle);
  return fromMeta === "" ? fileTitle : fromMeta;
}

function normalizeArticleId(value) {
  return normalizeScalar(value).toLowerCase();
}

function isValidArticleId(value) {
  return ID_REGEX.test(value);
}

function generateRandomArticleId(used) {
  for (;;) {
    const bytes = randomBytes(ID_LENGTH);
    let id = "";
    for (let i = 0; i < ID_LENGTH; i += 1) {
      id += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
    }
    if (!used.has(id)) {
      return id;
    }
  }
}

function parseFrontmatterBlock(block) {
  const lines = block.split(/\r?\n/);
  const frontmatter = {};
  let currentListKey = null;

  for (const line of lines) {
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
        frontmatter[key] = body.split(",").map((value) => stripWrappingQuotes(value.trim()));
      }
      continue;
    }

    frontmatter[key] = stripWrappingQuotes(trimmed);
  }

  return frontmatter;
}

function splitFrontmatterAndBody(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return {
      hasFrontmatter: false,
      frontmatter: {},
      body: content,
    };
  }

  return {
    hasFrontmatter: true,
    frontmatter: parseFrontmatterBlock(match[1]),
    body: match[2],
  };
}

function parseInlineMetadataFromTop(content) {
  const lines = content.split(/\r?\n/);
  const scanLimit = Math.min(lines.length, 120);
  let start = -1;
  let end = -1;
  const metadata = {};
  let count = 0;

  for (let i = 0; i < scanLimit; i += 1) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!match) {
      if (start !== -1) {
        end = i;
        break;
      }
      continue;
    }

    const key = match[1];
    if (!KNOWN_META_KEYS.has(key)) {
      if (start !== -1) {
        end = i;
        break;
      }
      continue;
    }

    if (start === -1) {
      start = i;
    }

    metadata[key] = stripWrappingQuotes(match[2].trim());
    count += 1;
  }

  if (start !== -1 && end === -1) {
    end = scanLimit;
  }

  if (count < 2 || start === -1 || end === -1) {
    return null;
  }

  const before = lines.slice(0, start);
  const after = lines.slice(end);
  let bodyLines = before.concat(after);

  while (bodyLines.length > 0 && bodyLines[0] === "") {
    bodyLines = bodyLines.slice(1);
  }

  return {
    metadata,
    body: bodyLines.join("\n"),
  };
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => normalizeScalar(tag)).filter(Boolean);
  }

  const text = normalizeScalar(value);
  if (text === "") {
    return [];
  }

  const separator = text.includes(";") ? ";" : ",";
  return text
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePublishDate(value) {
  const text = normalizeScalar(value);
  if (text === "") {
    return "";
  }

  const match = text.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일$/);
  if (!match) {
    return text;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return text;
  }

  return `${monthNames[month - 1]} ${day}, ${year}`;
}

function quoteYaml(value) {
  const text = String(value ?? "");
  if (text === "") {
    return '""';
  }

  if (/^[A-Za-z0-9._@/-]+$/.test(text)) {
    return text;
  }

  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function serializeFrontmatter(frontmatter) {
  const keys = [];

  for (const key of ORDERED_KEYS) {
    if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
      keys.push(key);
    }
  }

  for (const key of Object.keys(frontmatter)) {
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }

  const lines = [];
  for (const key of keys) {
    const value = frontmatter[key];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${quoteYaml(item)}`);
        }
      }
      continue;
    }

    lines.push(`${key}: ${quoteYaml(value)}`);
  }

  return lines.join("\n");
}

function extractCurrentArticleId(content) {
  const parsed = splitFrontmatterAndBody(content);
  if (parsed.hasFrontmatter) {
    return normalizeArticleId(parsed.frontmatter.ArticleId);
  }

  const inline = parseInlineMetadataFromTop(content);
  if (inline && Object.prototype.hasOwnProperty.call(inline.metadata, "ArticleId")) {
    return normalizeArticleId(inline.metadata.ArticleId);
  }

  return "";
}

function normalizeDoc(doc, idCounts, blockedIds) {
  const parsed = splitFrontmatterAndBody(doc.content);
  let frontmatter = { ...parsed.frontmatter };
  let body = parsed.body;
  let convertedInline = false;

  if (!parsed.hasFrontmatter) {
    const inline = parseInlineMetadataFromTop(doc.content);
    if (inline) {
      frontmatter = { ...inline.metadata };
      body = inline.body;
      convertedInline = true;
    }
  }

  delete frontmatter["notion-id"];
  frontmatter.base = BASE_LINK;
  frontmatter.Title = preferredTitle(doc.title, frontmatter.Title);

  if (Object.prototype.hasOwnProperty.call(frontmatter, "Tags")) {
    frontmatter.Tags = normalizeTags(frontmatter.Tags);
  }
  if (Object.prototype.hasOwnProperty.call(frontmatter, "PublishDate")) {
    frontmatter.PublishDate = normalizePublishDate(frontmatter.PublishDate);
  }

  const currentId = normalizeArticleId(frontmatter.ArticleId);
  const canKeepCurrentId =
    isValidArticleId(currentId) && (idCounts.get(currentId) ?? 0) === 1;

  let nextId = currentId;
  if (!canKeepCurrentId) {
    nextId = generateRandomArticleId(blockedIds);
    blockedIds.add(nextId);
  }
  frontmatter.ArticleId = nextId;

  const bodyNormalized = body.replace(/^\n+/, "");
  const frontmatterText = serializeFrontmatter(frontmatter);
  const output = `---\n${frontmatterText}\n---\n\n${bodyNormalized}`;

  return {
    output,
    convertedInline,
    assignedId: nextId,
  };
}

function main() {
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && fullPath.toLowerCase().endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  walk(ARTICLES_DIR);
  files.sort((a, b) => a.localeCompare(b));

  const docs = files.map((filePath) => ({
    filePath,
    title: path.basename(filePath).replace(/\.md$/i, ""),
    content: fs.readFileSync(filePath, "utf8"),
  }));

  const idCounts = new Map();
  const blockedIds = new Set();
  for (const doc of docs) {
    const id = extractCurrentArticleId(doc.content);
    if (!isValidArticleId(id)) {
      continue;
    }

    idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    blockedIds.add(id);
  }

  let convertedInlineCount = 0;
  let changedCount = 0;

  for (const doc of docs) {
    const result = normalizeDoc(doc, idCounts, blockedIds);
    if (result.convertedInline) {
      convertedInlineCount += 1;
    }
    if (result.output !== doc.content) {
      fs.writeFileSync(doc.filePath, result.output, "utf8");
      changedCount += 1;
    }
  }

  console.log(
    `Normalized ${docs.length} markdown file(s): changed=${changedCount}, inline_to_frontmatter=${convertedInlineCount}`
  );
}

main();
