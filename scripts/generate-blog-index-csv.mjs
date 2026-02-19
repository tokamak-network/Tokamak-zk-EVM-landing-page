import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "database", "blog");
const ARTICLES_DIR = path.join(BLOG_DIR, "articles");
const BASE_FILE = path.join(BLOG_DIR, "blog-index.base");
const CSV_FILE = path.join(BLOG_DIR, "blog-index.csv");
const BASE_LINK = "[[blog-index.base]]";

const DEFAULT_COLUMNS = [
  { propertyKey: "file.name", header: "Title" },
  { propertyKey: "AuthorEmail", header: "AuthorEmail" },
  { propertyKey: "Slug", header: "Slug" },
  { propertyKey: "CoverImage", header: "CoverImage" },
  { propertyKey: "PublishDate", header: "PublishDate" },
  { propertyKey: "CanonicalURL", header: "CanonicalURL" },
  { propertyKey: "Status", header: "Status" },
  { propertyKey: "Author", header: "Author" },
  { propertyKey: "Tags", header: "Tags" },
  { propertyKey: "ReadTimeMinutes", header: "ReadTimeMinutes" },
  { propertyKey: "Description", header: "Description" },
  { propertyKey: "CoverImageAlt", header: "CoverImageAlt" },
  { propertyKey: "Published", header: "Published" },
];

function printUsageAndExit() {
  console.error("Usage: node scripts/generate-blog-index-csv.mjs --init | --update-articles");
  process.exit(1);
}

function parseArgs(argv) {
  const hasInit = argv.includes("--init");
  const hasUpdate = argv.includes("--update-articles");

  if ((hasInit && hasUpdate) || (!hasInit && !hasUpdate)) {
    printUsageAndExit();
  }

  return {
    mode: hasInit ? "init" : "update-articles",
  };
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function loadColumnsFromBase(basePath) {
  if (!fileExists(basePath)) {
    return DEFAULT_COLUMNS;
  }

  const content = fs.readFileSync(basePath, "utf8");
  const lines = content.split(/\r?\n/);

  const displayNameByProperty = {};
  let inProperties = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trim() === "properties:") {
      inProperties = true;
      continue;
    }

    if (inProperties && /^\S/.test(line)) {
      inProperties = false;
    }

    if (!inProperties) {
      continue;
    }

    const propMatch = line.match(/^\s{2}([A-Za-z0-9_.-]+):\s*$/);
    if (!propMatch) {
      continue;
    }

    const propertyKey = propMatch[1];
    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j];
      if (!/^\s{4}/.test(next)) {
        break;
      }

      const displayMatch = next.match(/^\s{4}displayName:\s*(.*)$/);
      if (displayMatch) {
        displayNameByProperty[propertyKey] = stripWrappingQuotes(displayMatch[1].trim());
        break;
      }
    }
  }

  const orderedProperties = [];
  let inOrder = false;

  for (const line of lines) {
    if (line.trim() === "order:") {
      inOrder = true;
      continue;
    }

    if (inOrder) {
      const orderMatch = line.match(/^\s*\-\s+(.+)$/);
      if (!orderMatch) {
        if (line.trim() !== "") {
          inOrder = false;
        }
        continue;
      }
      orderedProperties.push(orderMatch[1].trim());
    }
  }

  if (orderedProperties.length === 0) {
    return DEFAULT_COLUMNS;
  }

  const columns = orderedProperties.map((propertyKey) => ({
    propertyKey,
    header: displayNameByProperty[propertyKey] || propertyKey,
  }));

  const hasTitle = columns.some((column) => column.propertyKey === "file.name" || column.header === "Title");
  if (!hasTitle) {
    return DEFAULT_COLUMNS;
  }

  return columns;
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

function splitFrontmatterAndBody(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content, hasFrontmatter: false };
  }

  return {
    frontmatter: parseFrontmatterBlock(match[1]),
    body: match[2],
    hasFrontmatter: true,
  };
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
        frontmatter[key] = body.split(",").map((v) => stripWrappingQuotes(v.trim()));
      }
      continue;
    }

    frontmatter[key] = stripWrappingQuotes(trimmed);
  }

  return frontmatter;
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(current);
      current = "";
      continue;
    }

    if (char === "\n") {
      row.push(current.replace(/\r$/, ""));
      if (row.some((cell) => cell !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.replace(/\r$/, ""));
    if (row.some((cell) => cell !== "")) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return { headers: [], data: [] };
  }

  const [headers, ...dataRows] = rows;
  const data = dataRows.map((cells) => {
    const obj = {};
    for (let i = 0; i < headers.length; i += 1) {
      obj[headers[i]] = cells[i] ?? "";
    }
    return obj;
  });

  return { headers, data };
}

function writeCsvFile(filePath, headers, rows) {
  const output = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header] ?? "")).join(",")),
  ].join("\n");

  fs.writeFileSync(filePath, `${output}\n`, "utf8");
}

function toCellValueForCsv(propertyKey, value) {
  if (propertyKey === "file.name") {
    return String(value ?? "");
  }

  if (propertyKey === "Tags") {
    if (Array.isArray(value)) {
      return value.join("; ");
    }
    return String(value ?? "");
  }

  if (propertyKey === "CoverImage") {
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }
    return String(value ?? "");
  }

  if (Array.isArray(value)) {
    return value.join("; ");
  }

  return String(value ?? "");
}

function parseTagCell(raw) {
  const text = (raw ?? "").trim();
  if (text === "") {
    return [];
  }

  const separator = text.includes(";") ? ";" : ",";
  return text
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeScalar(value) {
  return value == null ? "" : String(value).trim();
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }

  const text = normalizeScalar(value);
  if (text === "") {
    return [];
  }

  return [text];
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

function serializeFrontmatter(frontmatter, orderedKeys) {
  const lines = [];

  for (const key of orderedKeys) {
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

function managedFrontmatterFromRow(row, headerToProperty) {
  const managed = {
    base: BASE_LINK,
  };

  for (const [header, value] of Object.entries(row)) {
    const propertyKey = headerToProperty[header];
    if (!propertyKey || propertyKey === "file.name") {
      continue;
    }

    const raw = value ?? "";
    if (propertyKey === "Tags") {
      managed.Tags = parseTagCell(raw);
      continue;
    }

    if (propertyKey === "CoverImage") {
      const imageValue = normalizeScalar(raw);
      managed.CoverImage = imageValue === "" ? [] : [imageValue];
      continue;
    }

    managed[propertyKey] = normalizeScalar(raw);
  }

  return managed;
}

function equivalentValue(existing, target, key) {
  if (key === "Tags" || key === "CoverImage") {
    const left = asArray(existing);
    const right = asArray(target);
    return left.length === right.length && left.every((v, i) => v === right[i]);
  }

  return normalizeScalar(existing) === normalizeScalar(target);
}

function initCsv(columns) {
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((name) => name.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  const rows = [];

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter } = splitFrontmatterAndBody(content);

    if (frontmatter.base !== BASE_LINK) {
      continue;
    }

    const title = file.replace(/\.md$/i, "");
    const row = {};

    for (const column of columns) {
      if (column.propertyKey === "file.name") {
        row[column.header] = title;
        continue;
      }

      row[column.header] = toCellValueForCsv(column.propertyKey, frontmatter[column.propertyKey]);
    }

    rows.push(row);
  }

  writeCsvFile(CSV_FILE, columns.map((c) => c.header), rows);
  console.log(`Initialized ${CSV_FILE} from ${BASE_FILE} (${rows.length} rows)`);
}

function updateArticles(columns) {
  if (!fileExists(CSV_FILE)) {
    throw new Error(`CSV not found: ${CSV_FILE}. Run --init first.`);
  }

  const csvContent = fs.readFileSync(CSV_FILE, "utf8");
  const { headers, data } = parseCsv(csvContent);

  if (!headers.includes("Title")) {
    throw new Error('CSV must include a "Title" column.');
  }

  const headerToProperty = {};
  for (const column of columns) {
    headerToProperty[column.header] = column.propertyKey;
  }

  const managedPropertyKeys = columns
    .filter((column) => column.propertyKey !== "file.name")
    .map((column) => column.propertyKey);

  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((name) => name.toLowerCase().endsWith(".md"));

  const managedExistingByTitle = new Map();
  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter } = splitFrontmatterAndBody(content);
    if (frontmatter.base === BASE_LINK) {
      const title = file.replace(/\.md$/i, "");
      managedExistingByTitle.set(title, filePath);
    }
  }

  const targetTitles = new Set();
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const row of data) {
    const title = normalizeScalar(row.Title);
    if (title === "") {
      continue;
    }

    targetTitles.add(title);
    const filePath = path.join(ARTICLES_DIR, `${title}.md`);

    let existingFrontmatter = {};
    let body = "";
    let existed = false;

    if (fileExists(filePath)) {
      existed = true;
      const content = fs.readFileSync(filePath, "utf8");
      const parsed = splitFrontmatterAndBody(content);
      existingFrontmatter = parsed.frontmatter;
      body = parsed.body;
    }

    const targetManaged = managedFrontmatterFromRow(row, headerToProperty);

    let metadataChanged = !existed;

    if (existed) {
      if (normalizeScalar(existingFrontmatter.base) !== BASE_LINK) {
        metadataChanged = true;
      }

      for (const key of managedPropertyKeys) {
        if (!equivalentValue(existingFrontmatter[key], targetManaged[key], key)) {
          metadataChanged = true;
          break;
        }
      }
    }

    if (!metadataChanged) {
      unchanged += 1;
      continue;
    }

    const preservedExtraKeys = Object.keys(existingFrontmatter).filter(
      (key) => key !== "base" && !managedPropertyKeys.includes(key)
    );

    const orderedKeys = [
      ...preservedExtraKeys,
      "base",
      ...managedPropertyKeys,
    ];

    const nextFrontmatter = {};
    for (const key of preservedExtraKeys) {
      nextFrontmatter[key] = existingFrontmatter[key];
    }
    nextFrontmatter.base = BASE_LINK;
    for (const key of managedPropertyKeys) {
      nextFrontmatter[key] = targetManaged[key];
    }

    const fmText = serializeFrontmatter(nextFrontmatter, orderedKeys);
    const nextBody = body === "" ? "\nWrite your article here.\n" : body;
    const nextContent = `---\n${fmText}\n---\n\n${nextBody.replace(/^\n+/, "")}`;

    fs.writeFileSync(filePath, nextContent, "utf8");

    if (existed) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  let deleted = 0;
  for (const [title, filePath] of managedExistingByTitle.entries()) {
    if (!targetTitles.has(title)) {
      fs.unlinkSync(filePath);
      deleted += 1;
    }
  }

  console.log(
    `Updated articles from CSV: created=${created}, updated=${updated}, unchanged=${unchanged}, deleted=${deleted}`
  );
}

function main() {
  const { mode } = parseArgs(process.argv.slice(2));
  const columns = loadColumnsFromBase(BASE_FILE);

  if (mode === "init") {
    initCsv(columns);
    return;
  }

  updateArticles(columns);
}

main();
