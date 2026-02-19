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
  if (headers.length > 0) {
    headers[0] = headers[0].replace(/^\uFEFF/, "");
  }
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

function pushMapList(map, key, value) {
  if (!key) {
    return;
  }

  if (!map.has(key)) {
    map.set(key, []);
  }
  map.get(key).push(value);
}

function takeFirstUnmatched(map, key) {
  if (!map.has(key)) {
    return null;
  }

  const list = map.get(key);
  for (const item of list) {
    if (!item.matched) {
      return item;
    }
  }

  return null;
}

function validateCsvRows(data) {
  const normalizedRows = [];
  const emptyTitleRows = [];
  const duplicateMessages = [];
  const invalidPathRows = [];
  const seenTitleLine = new Map();

  for (let i = 0; i < data.length; i += 1) {
    const row = data[i];
    const lineNumber = i + 2;
    const title = normalizeScalar(row.Title);

    if (title === "") {
      emptyTitleRows.push(lineNumber);
      continue;
    }

    if (/[\\/]/.test(title)) {
      invalidPathRows.push({ lineNumber, title });
      continue;
    }

    if (seenTitleLine.has(title)) {
      duplicateMessages.push(
        `line ${lineNumber} duplicates Title "${title}" from line ${seenTitleLine.get(title)}`
      );
      continue;
    }

    seenTitleLine.set(title, lineNumber);
    normalizedRows.push({
      ...row,
      __title: title,
      __lineNumber: lineNumber,
    });
  }

  const errors = [];
  if (emptyTitleRows.length > 0) {
    errors.push(
      `CSV has empty Title value on line(s): ${emptyTitleRows.join(", ")}. Fill Title for every row.`
    );
  }
  if (duplicateMessages.length > 0) {
    errors.push(`CSV has duplicate Title values:\n- ${duplicateMessages.join("\n- ")}`);
  }
  if (invalidPathRows.length > 0) {
    const message = invalidPathRows
      .map(({ lineNumber, title }) => `line ${lineNumber}: "${title}"`)
      .join(", ");
    errors.push(`Title cannot include "/" or "\\": ${message}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  return normalizedRows;
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
  const normalizedRows = validateCsvRows(data);

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

  const existingDocs = [];
  const existingByTitle = new Map();
  const existingBySlug = new Map();

  for (const file of files) {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter, body } = splitFrontmatterAndBody(content);
    const title = file.replace(/\.md$/i, "");
    const doc = {
      filePath,
      title,
      slug: normalizeScalar(frontmatter.Slug),
      frontmatter,
      body,
      matched: false,
    };
    existingDocs.push(doc);
    pushMapList(existingByTitle, title, doc);
    pushMapList(existingBySlug, doc.slug, doc);
  }

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let renamed = 0;

  for (const row of normalizedRows) {
    const title = row.__title;
    const lineNumber = row.__lineNumber;
    const targetFilePath = path.join(ARTICLES_DIR, `${title}.md`);

    let matchedDoc = takeFirstUnmatched(existingByTitle, title);
    if (!matchedDoc) {
      const rowSlug = normalizeScalar(row.Slug);
      if (rowSlug !== "") {
        matchedDoc = takeFirstUnmatched(existingBySlug, rowSlug);
      }
    }

    let existingFrontmatter = {};
    let body = "";
    let existed = false;
    let fileWasRenamed = false;

    if (matchedDoc) {
      matchedDoc.matched = true;
      existed = true;
      existingFrontmatter = matchedDoc.frontmatter;
      body = matchedDoc.body;

      if (matchedDoc.filePath !== targetFilePath) {
        if (fileExists(targetFilePath)) {
          throw new Error(
            `Cannot sync CSV line ${lineNumber}: target file already exists: ${targetFilePath}`
          );
        }

        fs.renameSync(matchedDoc.filePath, targetFilePath);
        matchedDoc.filePath = targetFilePath;
        fileWasRenamed = true;
        renamed += 1;
      }
    } else if (fileExists(targetFilePath)) {
      existed = true;
      const content = fs.readFileSync(targetFilePath, "utf8");
      const parsed = splitFrontmatterAndBody(content);
      existingFrontmatter = parsed.frontmatter;
      body = parsed.body;
    }

    const targetManaged = managedFrontmatterFromRow(row, headerToProperty);

    let metadataChanged = !existed || fileWasRenamed;

    if (existed) {
      if (normalizeScalar(existingFrontmatter.base) !== BASE_LINK) {
        metadataChanged = true;
      }
      if (Object.prototype.hasOwnProperty.call(existingFrontmatter, "notion-id")) {
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
      (key) => key !== "base" && key !== "notion-id" && !managedPropertyKeys.includes(key)
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

    fs.writeFileSync(targetFilePath, nextContent, "utf8");

    if (existed) {
      updated += 1;
    } else {
      created += 1;
    }
  }

  let deleted = 0;
  for (const doc of existingDocs) {
    if (!doc.matched) {
      fs.unlinkSync(doc.filePath);
      deleted += 1;
    }
  }

  console.log(
    `Updated articles from CSV: created=${created}, updated=${updated}, unchanged=${unchanged}, renamed=${renamed}, deleted=${deleted}`
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

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
}
