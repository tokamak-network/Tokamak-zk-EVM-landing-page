import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "database", "blog");
const ARTICLES_DIR = path.join(BLOG_DIR, "articles");
const BASE_FILE = path.join(BLOG_DIR, "blog-index.base");
const CSV_FILE = path.join(BLOG_DIR, "blog-index.csv");
const BASE_LINK = "[[blog-index.base]]";
const UNIQUE_ID_KEY = "ArticleId";
const TITLE_META_KEY = "Title";

const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const ID_LENGTH = 8;
const ID_REGEX = /^[a-z0-9]{8}$/;

const DEFAULT_COLUMNS = [
  { propertyKey: "file.name", header: "Title" },
  { propertyKey: UNIQUE_ID_KEY, header: UNIQUE_ID_KEY },
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
  console.error(
    "Usage:\n" +
      "  node scripts/generate-blog-index-csv.mjs --init\n" +
      "  node scripts/generate-blog-index-csv.mjs --update-articles\n" +
      "  node scripts/generate-blog-index-csv.mjs --create-article <row-index>"
  );
  process.exit(1);
}

function parseArgs(argv) {
  const hasInit = argv.includes("--init");
  const hasUpdate = argv.includes("--update-articles");
  const createIndex = argv.indexOf("--create-article");
  const hasCreate = createIndex !== -1;

  const modeCount = Number(hasInit) + Number(hasUpdate) + Number(hasCreate);
  if (modeCount !== 1) {
    printUsageAndExit();
  }

  if (hasCreate) {
    const rowArg = argv[createIndex + 1];
    if (!rowArg) {
      throw new Error("Missing <row-index>. Example: --create-article 12");
    }

    const rowNumber = parsePositiveInteger(rowArg);
    if (rowNumber == null) {
      throw new Error(`Invalid row index: \"${rowArg}\". Use a positive integer (CSV header is line 1).`);
    }

    return {
      mode: "create-article",
      rowNumber,
    };
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

function isValidArticleId(id) {
  return ID_REGEX.test(id);
}

function parsePositiveInteger(value) {
  const text = normalizeScalar(value);
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
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
      const orderMatch = line.match(/^\s*-\s+(.+)$/);
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

  const hasTitle = columns.some((column) => column.propertyKey === "file.name");
  const hasId = columns.some((column) => column.propertyKey === UNIQUE_ID_KEY);
  if (!hasTitle || !hasId) {
    return DEFAULT_COLUMNS;
  }

  return columns;
}

function getColumnMaps(columns) {
  const headerToProperty = {};
  const propertyToHeader = {};

  for (const column of columns) {
    headerToProperty[column.header] = column.propertyKey;
    propertyToHeader[column.propertyKey] = column.header;
  }

  const titleHeader = propertyToHeader["file.name"] || "Title";
  const articleIdHeader = propertyToHeader[UNIQUE_ID_KEY] || UNIQUE_ID_KEY;
  const managedPropertyKeys = columns
    .filter((column) => column.propertyKey !== "file.name")
    .map((column) => column.propertyKey);

  if (!managedPropertyKeys.includes(UNIQUE_ID_KEY)) {
    throw new Error(
      `blog-index.base must define property \"${UNIQUE_ID_KEY}\". Add it to properties and view order.`
    );
  }

  return {
    headerToProperty,
    titleHeader,
    articleIdHeader,
    managedPropertyKeys,
  };
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

function writeArticleFile(filePath, frontmatter, orderedKeys, body) {
  const fmText = serializeFrontmatter(frontmatter, orderedKeys);
  const nextBody = body === "" ? "\nWrite your article here.\n" : body;
  const content = `---\n${fmText}\n---\n\n${nextBody.replace(/^\n+/, "")}`;
  fs.writeFileSync(filePath, content, "utf8");
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
  const text = normalizeScalar(raw);
  if (text === "") {
    return [];
  }

  const separator = text.includes(";") ? ";" : ",";
  return text
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
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

function equivalentValue(existing, target, key) {
  if (key === "Tags" || key === "CoverImage") {
    const left = asArray(existing);
    const right = asArray(target);
    return left.length === right.length && left.every((v, i) => v === right[i]);
  }

  return normalizeScalar(existing) === normalizeScalar(target);
}

function buildRowForHeaders(sourceRow, headers) {
  const row = {};
  for (const header of headers) {
    row[header] = sourceRow[header] ?? "";
  }
  return row;
}

function rowFromDoc(doc, columns) {
  const row = {};

  for (const column of columns) {
    if (column.propertyKey === "file.name") {
      row[column.header] = doc.title;
      continue;
    }

    row[column.header] = toCellValueForCsv(column.propertyKey, doc.frontmatter[column.propertyKey]);
  }

  return row;
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

    if (propertyKey === UNIQUE_ID_KEY) {
      managed[UNIQUE_ID_KEY] = normalizeArticleId(raw);
      continue;
    }

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

function generateRandomArticleId(usedIds) {
  for (;;) {
    const bytes = randomBytes(ID_LENGTH);
    let id = "";
    for (let i = 0; i < ID_LENGTH; i += 1) {
      id += ID_ALPHABET[bytes[i] % ID_ALPHABET.length];
    }

    if (!usedIds.has(id)) {
      return id;
    }
  }
}

function collectMarkdownFilesRecursive(dirPath) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  walk(dirPath);
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function readArticleDocs() {
  if (!fileExists(ARTICLES_DIR)) {
    return [];
  }

  const docs = [];
  const entries = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  for (const entry of entries) {
    const entryPath = path.join(ARTICLES_DIR, entry.name);

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      const content = fs.readFileSync(entryPath, "utf8");
      const { frontmatter, body } = splitFrontmatterAndBody(content);
      const fileTitle = entry.name.replace(/\.md$/i, "");
      docs.push({
        filePath: entryPath,
        articleDir: ARTICLES_DIR,
        title: preferredTitle(fileTitle, frontmatter[TITLE_META_KEY]),
        frontmatter,
        body,
        matched: false,
      });
      continue;
    }

    if (!entry.isDirectory()) {
      continue;
    }

    const markdownFiles = collectMarkdownFilesRecursive(entryPath);
    if (markdownFiles.length === 0) {
      continue;
    }
    if (markdownFiles.length > 1) {
      throw new Error(
        `Article directory must contain exactly one markdown file: ${entryPath} (found ${markdownFiles.length}).`
      );
    }

    const filePath = markdownFiles[0];
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter, body } = splitFrontmatterAndBody(content);
    const fileTitle = path.basename(filePath).replace(/\.md$/i, "");
    docs.push({
      filePath,
      articleDir: entryPath,
      title: preferredTitle(fileTitle, frontmatter[TITLE_META_KEY]),
      frontmatter,
      body,
      matched: false,
    });
  }

  docs.sort((a, b) => a.filePath.localeCompare(b.filePath));
  return docs;
}

function ensureArticleDirectoryLayout(docs) {
  const reservedTargetDirs = new Set();
  let dirRenamed = 0;
  let fileMoved = 0;

  for (const doc of docs) {
    const articleId = normalizeArticleId(doc.frontmatter[UNIQUE_ID_KEY]);
    if (!isValidArticleId(articleId)) {
      throw new Error(`${doc.filePath} has invalid ${UNIQUE_ID_KEY} after normalization.`);
    }

    const targetDir = path.join(ARTICLES_DIR, articleId);
    if (reservedTargetDirs.has(targetDir)) {
      throw new Error(`Duplicate target directory for ${UNIQUE_ID_KEY}: ${articleId}`);
    }
    reservedTargetDirs.add(targetDir);
  }

  for (const doc of docs) {
    const articleId = normalizeArticleId(doc.frontmatter[UNIQUE_ID_KEY]);
    const targetDir = path.join(ARTICLES_DIR, articleId);
    if (doc.title === "" || /[\\/]/.test(doc.title)) {
      throw new Error(
        `${doc.filePath} has invalid ${TITLE_META_KEY}="${doc.title}". ` +
          `${TITLE_META_KEY} cannot be empty and must not include / or \\.`
      );
    }

    if (doc.articleDir !== targetDir) {
      if (fileExists(targetDir)) {
        throw new Error(
          `Cannot move article ${doc.filePath} to ${targetDir}: target directory already exists.`
        );
      }

      if (doc.articleDir === ARTICLES_DIR) {
        fs.mkdirSync(targetDir, { recursive: true });
        const movedPath = path.join(targetDir, path.basename(doc.filePath));
        fs.renameSync(doc.filePath, movedPath);
        doc.filePath = movedPath;
      } else {
        fs.renameSync(doc.articleDir, targetDir);
        doc.filePath = path.join(targetDir, path.relative(doc.articleDir, doc.filePath));
      }

      doc.articleDir = targetDir;
      dirRenamed += 1;
    }

    const targetFilePath = path.join(doc.articleDir, `${doc.title}.md`);
    if (doc.filePath !== targetFilePath) {
      if (fileExists(targetFilePath)) {
        throw new Error(`Cannot move ${doc.filePath} to ${targetFilePath}: target file already exists.`);
      }

      fs.renameSync(doc.filePath, targetFilePath);
      doc.filePath = targetFilePath;
      fileMoved += 1;
    }
  }

  return { dirRenamed, fileMoved };
}

function ensureDocArticleIds(docs) {
  const validCounts = new Map();

  for (const doc of docs) {
    const normalized = normalizeArticleId(doc.frontmatter[UNIQUE_ID_KEY]);
    if (isValidArticleId(normalized)) {
      validCounts.set(normalized, (validCounts.get(normalized) || 0) + 1);
    }
  }

  const used = new Set();
  let reassigned = 0;
  let rewritten = 0;

  for (const doc of docs) {
    const currentRaw = doc.frontmatter[UNIQUE_ID_KEY];
    const current = normalizeArticleId(currentRaw);
    const hasNotionId = Object.prototype.hasOwnProperty.call(doc.frontmatter, "notion-id");
    const titleValue = normalizeScalar(doc.frontmatter[TITLE_META_KEY]);

    let nextId = current;
    const needsReassign = !isValidArticleId(current) || (validCounts.get(current) || 0) > 1 || used.has(current);

    if (needsReassign) {
      nextId = generateRandomArticleId(used);
      reassigned += 1;
    }

    used.add(nextId);

    let changed = false;
    if (normalizeArticleId(currentRaw) !== nextId) {
      doc.frontmatter[UNIQUE_ID_KEY] = nextId;
      changed = true;
    }

    if (hasNotionId) {
      delete doc.frontmatter["notion-id"];
      changed = true;
    }
    if (titleValue !== doc.title) {
      doc.frontmatter[TITLE_META_KEY] = doc.title;
      changed = true;
    }

    if (changed) {
      const orderedKeys = Object.keys(doc.frontmatter).filter((key) => key !== "notion-id");
      if (!orderedKeys.includes(UNIQUE_ID_KEY)) {
        orderedKeys.push(UNIQUE_ID_KEY);
      }
      writeArticleFile(doc.filePath, doc.frontmatter, orderedKeys, doc.body);
      rewritten += 1;
    }
  }

  return {
    reassigned,
    rewritten,
    usedIds: used,
  };
}

function collectUsedIdsFromCsv(data, articleIdHeader) {
  const used = new Set();

  for (const row of data) {
    const id = normalizeArticleId(row[articleIdHeader]);
    if (!isValidArticleId(id)) {
      continue;
    }
    used.add(id);
  }

  return used;
}

function buildDocMapById(docs) {
  const map = new Map();

  for (const doc of docs) {
    const id = normalizeArticleId(doc.frontmatter[UNIQUE_ID_KEY]);
    if (!isValidArticleId(id)) {
      throw new Error(`${doc.filePath} has invalid ${UNIQUE_ID_KEY} after normalization.`);
    }
    if (map.has(id)) {
      throw new Error(`Duplicate ${UNIQUE_ID_KEY} in article files: ${id}`);
    }

    map.set(id, doc);
  }

  return map;
}

function initCsv(columns) {
  const docs = readArticleDocs();
  const idReport = ensureDocArticleIds(docs);
  const layoutReport = ensureArticleDirectoryLayout(docs);

  const rows = [];
  for (const doc of docs) {
    if (doc.frontmatter.base !== BASE_LINK) {
      continue;
    }

    rows.push(rowFromDoc(doc, columns));
  }

  const headers = columns.map((column) => column.header);
  writeCsvFile(CSV_FILE, headers, rows);

  const migrationMsg =
    idReport.reassigned > 0 ||
    idReport.rewritten > 0 ||
    layoutReport.dirRenamed > 0 ||
    layoutReport.fileMoved > 0
      ? `, id_reassigned=${idReport.reassigned}, docs_rewritten=${idReport.rewritten}, dirs_renamed=${layoutReport.dirRenamed}, files_moved=${layoutReport.fileMoved}`
      : "";

  console.log(`Initialized ${CSV_FILE} from ${BASE_FILE} (${rows.length} rows${migrationMsg})`);
}

function createArticle(columns, rowNumber) {
  if (!fileExists(CSV_FILE)) {
    throw new Error(`CSV not found: ${CSV_FILE}. Run --init first.`);
  }

  const maps = getColumnMaps(columns);
  const csvContent = fs.readFileSync(CSV_FILE, "utf8");
  const { headers, data } = parseCsv(csvContent);

  if (!headers.includes(maps.titleHeader)) {
    throw new Error(`CSV must include a \"${maps.titleHeader}\" column.`);
  }
  if (!headers.includes(maps.articleIdHeader)) {
    throw new Error(`CSV must include a \"${maps.articleIdHeader}\" column.`);
  }

  const firstDataLine = 2;
  const lastDataLine = data.length + 1;

  if (rowNumber < firstDataLine || rowNumber > lastDataLine) {
    throw new Error(
      `Row index ${rowNumber} is out of range. CSV data lines are ${firstDataLine}-${lastDataLine}.`
    );
  }

  const row = data[rowNumber - 2];
  const csvLine = rowNumber;
  const title = normalizeScalar(row[maps.titleHeader]);
  const idRaw = normalizeScalar(row[maps.articleIdHeader]);

  if (title === "") {
    throw new Error(`CSV line ${csvLine} has empty Title. Fill Title before creating an article.`);
  }
  if (/[\\/]/.test(title)) {
    throw new Error(`CSV line ${csvLine} has invalid Title \"${title}\". Do not use / or \\.`);
  }
  if (idRaw !== "") {
    throw new Error(
      `CSV line ${csvLine} already has ${UNIQUE_ID_KEY}=${idRaw}. Use --update-articles for existing documents.`
    );
  }

  for (let i = 0; i < data.length; i += 1) {
    if (i === rowNumber - 2) {
      continue;
    }

    const peerTitle = normalizeScalar(data[i][maps.titleHeader]);
    if (peerTitle !== "" && peerTitle === title) {
      throw new Error(`CSV line ${csvLine} Title \"${title}\" duplicates line ${i + 2}.`);
    }
  }

  const docs = readArticleDocs();
  const idReport = ensureDocArticleIds(docs);
  ensureArticleDirectoryLayout(docs);
  const usedIds = new Set(idReport.usedIds);

  const usedCsvIds = collectUsedIdsFromCsv(data, maps.articleIdHeader);
  for (const id of usedCsvIds) {
    usedIds.add(id);
  }

  const newId = generateRandomArticleId(usedIds);
  row[maps.articleIdHeader] = newId;

  const targetDir = path.join(ARTICLES_DIR, newId);
  if (fileExists(targetDir)) {
    throw new Error(`Cannot create article. Directory already exists: ${targetDir}`);
  }
  fs.mkdirSync(targetDir, { recursive: true });
  const targetFilePath = path.join(targetDir, `${title}.md`);

  const managed = managedFrontmatterFromRow(row, maps.headerToProperty);
  managed[UNIQUE_ID_KEY] = newId;

  const frontmatter = { base: BASE_LINK };
  for (const key of maps.managedPropertyKeys) {
    frontmatter[key] = managed[key] ?? "";
  }
  frontmatter[TITLE_META_KEY] = title;

  writeArticleFile(
    targetFilePath,
    frontmatter,
    ["base", ...maps.managedPropertyKeys, TITLE_META_KEY],
    "\nWrite your article here.\n"
  );

  writeCsvFile(CSV_FILE, headers, data.map((item) => buildRowForHeaders(item, headers)));
  initCsv(columns);

  console.log(
    `Created article from CSV row ${rowNumber}: ${path.relative(ROOT_DIR, targetFilePath)} (${UNIQUE_ID_KEY}=${newId})`
  );
}

function syncDocFromCsvRow(doc, row, maps) {
  const articleId = normalizeArticleId(doc.frontmatter[UNIQUE_ID_KEY]);
  let title = normalizeScalar(row[maps.titleHeader]);

  if (title === "" || /[\\/]/.test(title)) {
    title = doc.title;
  }

  row[maps.titleHeader] = title;
  row[maps.articleIdHeader] = articleId;

  const targetFilePath = path.join(doc.articleDir, `${title}.md`);
  let fileWasRenamed = false;

  if (doc.filePath !== targetFilePath) {
    if (fileExists(targetFilePath)) {
      throw new Error(`Cannot rename ${doc.filePath} to ${targetFilePath}: target file already exists.`);
    }

    fs.renameSync(doc.filePath, targetFilePath);
    doc.filePath = targetFilePath;
    doc.title = title;
    fileWasRenamed = true;
  }

  const targetManaged = managedFrontmatterFromRow(row, maps.headerToProperty);
  targetManaged[UNIQUE_ID_KEY] = articleId;

  let metadataChanged = fileWasRenamed;
  const existingFrontmatter = doc.frontmatter;
  const existingTitleMeta = normalizeScalar(existingFrontmatter[TITLE_META_KEY]);

  if (normalizeScalar(existingFrontmatter.base) !== BASE_LINK) {
    metadataChanged = true;
  }
  if (Object.prototype.hasOwnProperty.call(existingFrontmatter, "notion-id")) {
    metadataChanged = true;
  }
  if (existingTitleMeta !== title) {
    metadataChanged = true;
  }

  for (const key of maps.managedPropertyKeys) {
    if (!equivalentValue(existingFrontmatter[key], targetManaged[key], key)) {
      metadataChanged = true;
      break;
    }
  }

  if (!metadataChanged) {
    return { updated: false, renamed: fileWasRenamed };
  }

  const preservedExtraKeys = Object.keys(existingFrontmatter).filter(
    (key) =>
      key !== "base" &&
      key !== "notion-id" &&
      key !== TITLE_META_KEY &&
      !maps.managedPropertyKeys.includes(key)
  );

  const orderedKeys = [...preservedExtraKeys, "base", ...maps.managedPropertyKeys, TITLE_META_KEY];
  const nextFrontmatter = {};

  for (const key of preservedExtraKeys) {
    nextFrontmatter[key] = existingFrontmatter[key];
  }
  nextFrontmatter.base = BASE_LINK;
  for (const key of maps.managedPropertyKeys) {
    nextFrontmatter[key] = targetManaged[key] ?? "";
  }
  nextFrontmatter[TITLE_META_KEY] = title;

  writeArticleFile(doc.filePath, nextFrontmatter, orderedKeys, doc.body);
  doc.frontmatter = nextFrontmatter;

  return { updated: true, renamed: fileWasRenamed };
}

function updateArticles(columns) {
  if (!fileExists(CSV_FILE)) {
    throw new Error(`CSV not found: ${CSV_FILE}. Run --init first.`);
  }

  const maps = getColumnMaps(columns);
  const csvContent = fs.readFileSync(CSV_FILE, "utf8");
  const { headers, data } = parseCsv(csvContent);

  if (!headers.includes(maps.titleHeader)) {
    throw new Error(`CSV must include a \"${maps.titleHeader}\" column.`);
  }
  if (!headers.includes(maps.articleIdHeader)) {
    throw new Error(`CSV must include a \"${maps.articleIdHeader}\" column.`);
  }

  const docs = readArticleDocs();
  const idReport = ensureDocArticleIds(docs);
  const layoutReport = ensureArticleDirectoryLayout(docs);
  const docsById = buildDocMapById(docs);

  const matchedIds = new Set();
  const rowsOut = [];

  let updated = 0;
  let unchanged = 0;
  let renamed = 0;
  let csvRemoved = 0;
  let csvAppended = 0;
  let csvRemovedWithoutId = 0;

  for (const row of data) {
    const id = normalizeArticleId(row[maps.articleIdHeader]);

    if (id === "") {
      csvRemoved += 1;
      csvRemovedWithoutId += 1;
      continue;
    }

    if (!isValidArticleId(id)) {
      csvRemoved += 1;
      continue;
    }

    if (matchedIds.has(id)) {
      csvRemoved += 1;
      continue;
    }

    const doc = docsById.get(id);
    if (!doc) {
      csvRemoved += 1;
      continue;
    }

    matchedIds.add(id);
    doc.matched = true;

    const result = syncDocFromCsvRow(doc, row, maps);
    if (result.updated) {
      updated += 1;
    } else {
      unchanged += 1;
    }
    if (result.renamed) {
      renamed += 1;
    }

    rowsOut.push(row);
  }

  for (const doc of docs) {
    const id = normalizeArticleId(doc.frontmatter[UNIQUE_ID_KEY]);
    if (matchedIds.has(id)) {
      continue;
    }

    rowsOut.push(rowFromDoc(doc, columns));
    csvAppended += 1;
  }

  const headersOut = columns.map((column) => column.header);
  const projectedRows = rowsOut.map((row) => buildRowForHeaders(row, headersOut));
  writeCsvFile(CSV_FILE, headersOut, projectedRows);

  console.log(
    `Updated articles by ${UNIQUE_ID_KEY}: updated=${updated}, unchanged=${unchanged}, renamed=${renamed}, ` +
      `csv_removed=${csvRemoved}, csv_removed_without_id=${csvRemovedWithoutId}, csv_appended=${csvAppended}, ` +
      `id_reassigned=${idReport.reassigned}, dirs_renamed=${layoutReport.dirRenamed}, files_moved=${layoutReport.fileMoved}`
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const columns = loadColumnsFromBase(BASE_FILE);

  if (args.mode === "init") {
    initCsv(columns);
    return;
  }

  if (args.mode === "create-article") {
    createArticle(columns, args.rowNumber);
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
