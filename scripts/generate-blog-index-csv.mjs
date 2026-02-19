import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const BLOG_DIR = path.join(ROOT_DIR, "database", "blog");
const ARTICLES_DIR = path.join(BLOG_DIR, "articles");
const BASE_FILE = path.join(BLOG_DIR, "blog-index.base");
const CSV_FILE = path.join(BLOG_DIR, "blog-index.csv");
const BASE_LINK = "[[blog-index.base]]";
const UNIQUE_ID_KEY = "ArticleId";

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
      "  node scripts/generate-blog-index-csv.mjs --create-article <row-number>"
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
      throw new Error("Missing <row-number>. Example: --create-article 3");
    }

    const rowNumber = parsePositiveInteger(rowArg);
    if (rowNumber == null) {
      throw new Error(`Invalid row number: "${rowArg}". Use a positive integer (data row starts at 1).`);
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

  const hasTitle = columns.some((column) => column.propertyKey === "file.name");
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

function writeArticleFile(filePath, frontmatter, orderedKeys, body) {
  const fmText = serializeFrontmatter(frontmatter, orderedKeys);
  const nextBody = body === "" ? "\nWrite your article here.\n" : body;
  const content = `---\n${fmText}\n---\n\n${nextBody.replace(/^\n+/, "")}`;
  fs.writeFileSync(filePath, content, "utf8");
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
    propertyToHeader,
    titleHeader,
    articleIdHeader,
    managedPropertyKeys,
  };
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

    if (propertyKey === UNIQUE_ID_KEY) {
      const idValue = parsePositiveInteger(raw);
      managed[UNIQUE_ID_KEY] = idValue == null ? "" : String(idValue);
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

function readArticleDocs() {
  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((name) => name.toLowerCase().endsWith(".md"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const filePath = path.join(ARTICLES_DIR, file);
    const content = fs.readFileSync(filePath, "utf8");
    const { frontmatter, body } = splitFrontmatterAndBody(content);

    return {
      file,
      filePath,
      title: file.replace(/\.md$/i, ""),
      frontmatter,
      body,
      matched: false,
    };
  });
}

function collectUsedArticleIdsFromDocs(docs) {
  const used = new Set();
  let maxId = 0;

  for (const doc of docs) {
    const raw = normalizeScalar(doc.frontmatter[UNIQUE_ID_KEY]);
    if (raw === "") {
      continue;
    }

    const parsed = parsePositiveInteger(raw);
    if (parsed == null) {
      throw new Error(`${doc.filePath} has invalid ${UNIQUE_ID_KEY}: \"${raw}\". Use a positive integer.`);
    }

    if (used.has(parsed)) {
      throw new Error(`Duplicate ${UNIQUE_ID_KEY} in articles: ${parsed}.`);
    }

    used.add(parsed);
    if (parsed > maxId) {
      maxId = parsed;
    }
  }

  return { used, maxId };
}

function ensureArticleIdsInDocs(docs) {
  const { used, maxId } = collectUsedArticleIdsFromDocs(docs);
  let nextId = maxId + 1;
  let assigned = 0;

  for (const doc of docs) {
    const raw = normalizeScalar(doc.frontmatter[UNIQUE_ID_KEY]);
    if (raw !== "") {
      continue;
    }

    while (used.has(nextId)) {
      nextId += 1;
    }

    const assignedId = String(nextId);
    used.add(nextId);
    nextId += 1;

    doc.frontmatter[UNIQUE_ID_KEY] = assignedId;

    const orderedKeys = Object.keys(doc.frontmatter).filter((key) => key !== "notion-id");
    if (!orderedKeys.includes(UNIQUE_ID_KEY)) {
      orderedKeys.push(UNIQUE_ID_KEY);
    }

    writeArticleFile(doc.filePath, doc.frontmatter, orderedKeys, doc.body);
    assigned += 1;
  }

  return assigned;
}

function collectUsedArticleIdsFromCsv(data, articleIdHeader) {
  const used = new Set();
  let maxId = 0;

  for (let i = 0; i < data.length; i += 1) {
    const row = data[i];
    const lineNumber = i + 2;
    const raw = normalizeScalar(row[articleIdHeader]);

    if (raw === "") {
      continue;
    }

    const parsed = parsePositiveInteger(raw);
    if (parsed == null) {
      throw new Error(`CSV line ${lineNumber} has invalid ${UNIQUE_ID_KEY}: \"${raw}\". Use a positive integer.`);
    }

    if (used.has(parsed)) {
      throw new Error(`CSV has duplicate ${UNIQUE_ID_KEY}: ${parsed}.`);
    }

    used.add(parsed);
    if (parsed > maxId) {
      maxId = parsed;
    }
  }

  return { used, maxId };
}

function validateCsvRowsForUpdate(data, titleHeader, articleIdHeader) {
  const normalizedRows = [];
  const errors = [];
  const seenTitles = new Map();
  const seenIds = new Map();

  for (let i = 0; i < data.length; i += 1) {
    const row = data[i];
    const lineNumber = i + 2;
    const title = normalizeScalar(row[titleHeader]);
    const idRaw = normalizeScalar(row[articleIdHeader]);

    if (title === "") {
      errors.push(`line ${lineNumber}: Title is empty`);
      continue;
    }

    if (/[\\/]/.test(title)) {
      errors.push(`line ${lineNumber}: Title contains invalid path separator: \"${title}\"`);
      continue;
    }

    if (seenTitles.has(title)) {
      errors.push(
        `line ${lineNumber}: duplicate Title \"${title}\" (already used on line ${seenTitles.get(title)})`
      );
      continue;
    }
    seenTitles.set(title, lineNumber);

    if (idRaw === "") {
      errors.push(
        `line ${lineNumber}: ${UNIQUE_ID_KEY} is empty. Create the document first with --create-article ${i + 1}.`
      );
      continue;
    }

    const idNum = parsePositiveInteger(idRaw);
    if (idNum == null) {
      errors.push(`line ${lineNumber}: invalid ${UNIQUE_ID_KEY} \"${idRaw}\"`);
      continue;
    }

    if (seenIds.has(idNum)) {
      errors.push(
        `line ${lineNumber}: duplicate ${UNIQUE_ID_KEY} ${idNum} (already used on line ${seenIds.get(idNum)})`
      );
      continue;
    }
    seenIds.set(idNum, lineNumber);

    normalizedRows.push({
      ...row,
      __title: title,
      __lineNumber: lineNumber,
      __articleId: String(idNum),
    });
  }

  if (errors.length > 0) {
    throw new Error(`CSV validation failed:\n- ${errors.join("\n- ")}`);
  }

  return normalizedRows;
}

function nextArticleId(docs, data, articleIdHeader) {
  const docStats = collectUsedArticleIdsFromDocs(docs);
  const csvStats = collectUsedArticleIdsFromCsv(data, articleIdHeader);
  return Math.max(docStats.maxId, csvStats.maxId) + 1;
}

function initCsv(columns) {
  const { titleHeader } = getColumnMaps(columns);
  const docs = readArticleDocs();
  const assignedCount = ensureArticleIdsInDocs(docs);

  const rows = [];
  for (const doc of docs) {
    if (doc.frontmatter.base !== BASE_LINK) {
      continue;
    }

    const row = {};
    for (const column of columns) {
      if (column.propertyKey === "file.name") {
        row[column.header] = doc.title;
      } else {
        row[column.header] = toCellValueForCsv(column.propertyKey, doc.frontmatter[column.propertyKey]);
      }
    }
    rows.push(row);
  }

  writeCsvFile(CSV_FILE, columns.map((c) => c.header), rows);

  const assignedSuffix = assignedCount > 0 ? `, assigned ${UNIQUE_ID_KEY} to ${assignedCount} article(s)` : "";
  console.log(`Initialized ${CSV_FILE} from ${BASE_FILE} (${rows.length} rows${assignedSuffix})`);

  if (!columns.some((c) => c.header === titleHeader)) {
    throw new Error("Title column mapping failed.");
  }
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

  if (rowNumber < 1 || rowNumber > data.length) {
    throw new Error(
      `Row ${rowNumber} is out of range. CSV has ${data.length} data row(s). Row number starts at 1.`
    );
  }

  const row = data[rowNumber - 1];
  const csvLine = rowNumber + 1;
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
    if (i === rowNumber - 1) {
      continue;
    }
    const peerTitle = normalizeScalar(data[i][maps.titleHeader]);
    if (peerTitle !== "" && peerTitle === title) {
      throw new Error(
        `CSV line ${csvLine} Title \"${title}\" duplicates line ${i + 2}. Titles must be unique.`
      );
    }
  }

  const docs = readArticleDocs();
  ensureArticleIdsInDocs(docs);

  const newId = nextArticleId(docs, data, maps.articleIdHeader);
  const targetFilePath = path.join(ARTICLES_DIR, `${title}.md`);
  if (fileExists(targetFilePath)) {
    throw new Error(`Cannot create article. File already exists: ${targetFilePath}`);
  }

  row[maps.articleIdHeader] = String(newId);

  const targetManaged = managedFrontmatterFromRow(row, maps.headerToProperty);
  targetManaged[UNIQUE_ID_KEY] = String(newId);

  const nextFrontmatter = {
    base: BASE_LINK,
  };
  for (const key of maps.managedPropertyKeys) {
    nextFrontmatter[key] = targetManaged[key] ?? "";
  }

  writeArticleFile(targetFilePath, nextFrontmatter, ["base", ...maps.managedPropertyKeys], "\nWrite your article here.\n");
  writeCsvFile(CSV_FILE, headers, data);

  initCsv(columns);

  console.log(`Created article from CSV row ${rowNumber}: ${title}.md (${UNIQUE_ID_KEY}=${newId})`);
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

  const rows = validateCsvRowsForUpdate(data, maps.titleHeader, maps.articleIdHeader);

  const docs = readArticleDocs();
  const assignedCount = ensureArticleIdsInDocs(docs);

  const docsByArticleId = new Map();
  for (const doc of docs) {
    const raw = normalizeScalar(doc.frontmatter[UNIQUE_ID_KEY]);
    const parsed = parsePositiveInteger(raw);
    if (parsed == null) {
      throw new Error(`${doc.filePath} has invalid ${UNIQUE_ID_KEY}: \"${raw}\".`);
    }

    const id = String(parsed);
    if (docsByArticleId.has(id)) {
      throw new Error(`Duplicate ${UNIQUE_ID_KEY} in article files: ${id}`);
    }

    docsByArticleId.set(id, doc);
  }

  let updated = 0;
  let unchanged = 0;
  let renamed = 0;

  for (const row of rows) {
    const title = row.__title;
    const lineNumber = row.__lineNumber;
    const articleId = row.__articleId;
    const targetFilePath = path.join(ARTICLES_DIR, `${title}.md`);

    const doc = docsByArticleId.get(articleId);
    if (!doc) {
      throw new Error(
        `CSV line ${lineNumber} has ${UNIQUE_ID_KEY}=${articleId}, but no matching article file exists. ` +
          `New article creation via --update-articles is disabled. Use --create-article ${lineNumber - 1}.`
      );
    }

    doc.matched = true;

    let existingFrontmatter = doc.frontmatter;
    const body = doc.body;
    let fileWasRenamed = false;

    if (doc.filePath !== targetFilePath) {
      if (fileExists(targetFilePath)) {
        throw new Error(`Cannot sync CSV line ${lineNumber}: target file already exists: ${targetFilePath}`);
      }

      fs.renameSync(doc.filePath, targetFilePath);
      doc.filePath = targetFilePath;
      doc.title = title;
      fileWasRenamed = true;
      renamed += 1;
    }

    const targetManaged = managedFrontmatterFromRow(row, maps.headerToProperty);
    targetManaged[UNIQUE_ID_KEY] = articleId;

    let metadataChanged = fileWasRenamed;

    if (normalizeScalar(existingFrontmatter.base) !== BASE_LINK) {
      metadataChanged = true;
    }
    if (Object.prototype.hasOwnProperty.call(existingFrontmatter, "notion-id")) {
      metadataChanged = true;
    }

    for (const key of maps.managedPropertyKeys) {
      if (!equivalentValue(existingFrontmatter[key], targetManaged[key], key)) {
        metadataChanged = true;
        break;
      }
    }

    if (!metadataChanged) {
      unchanged += 1;
      continue;
    }

    const preservedExtraKeys = Object.keys(existingFrontmatter).filter(
      (key) => key !== "base" && key !== "notion-id" && !maps.managedPropertyKeys.includes(key)
    );

    const orderedKeys = [...preservedExtraKeys, "base", ...maps.managedPropertyKeys];
    const nextFrontmatter = {};

    for (const key of preservedExtraKeys) {
      nextFrontmatter[key] = existingFrontmatter[key];
    }
    nextFrontmatter.base = BASE_LINK;
    for (const key of maps.managedPropertyKeys) {
      nextFrontmatter[key] = targetManaged[key] ?? "";
    }

    writeArticleFile(doc.filePath, nextFrontmatter, orderedKeys, body);
    updated += 1;
  }

  let deleted = 0;
  for (const doc of docs) {
    if (!doc.matched) {
      fs.unlinkSync(doc.filePath);
      deleted += 1;
    }
  }

  const assignedSuffix = assignedCount > 0 ? `, assigned ${UNIQUE_ID_KEY}=${assignedCount}` : "";
  console.log(
    `Updated articles from CSV: created=0, updated=${updated}, unchanged=${unchanged}, renamed=${renamed}, deleted=${deleted}${assignedSuffix}`
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
