#!/usr/bin/env node
/**
 * Find unused exported components / functions under src/.
 *
 * Being exported is NOT treated as "used". For each export name we grep the
 * codebase; if the name appears in fewer than MIN_PLACES files, it is unused.
 *
 * Usage:
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/find-unused.ts
 *   npx tsx scripts/find-unused.ts
 *   npx tsx scripts/find-unused.ts --min 2 --json
 *
 *   node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/find-unused.ts
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

const MIN_PLACES_DEFAULT = 2;
const SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "coverage",
  "scripts",
]);

/** Next.js / framework entry filenames — default exports here are consumed by the router. */
const FRAMEWORK_ENTRY_FILES = new Set([
  "page.tsx",
  "page.ts",
  "page.jsx",
  "page.js",
  "layout.tsx",
  "layout.ts",
  "template.tsx",
  "template.ts",
  "loading.tsx",
  "loading.ts",
  "error.tsx",
  "error.ts",
  "not-found.tsx",
  "not-found.ts",
  "default.tsx",
  "default.ts",
  "route.ts",
  "route.js",
  "middleware.ts",
  "middleware.js",
  "proxy.ts",
  "instrumentation.ts",
]);

type ExportKind = "function" | "component" | "const" | "class" | "named";

type ExportedSymbol = {
  name: string;
  kind: ExportKind;
  file: string;
  line: number;
};

type UnusedHit = ExportedSymbol & {
  places: number;
  files: string[];
};

function parseArgs(argv: string[]) {
  let minPlaces = MIN_PLACES_DEFAULT;
  let json = false;
  let root = SRC;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--min" || arg === "-m") {
      const value = Number(argv[++i]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error(`Invalid --min value: ${argv[i]}`);
      }
      minPlaces = value;
    } else if (arg === "--json") {
      json = true;
    } else if (arg === "--root") {
      root = path.resolve(ROOT, argv[++i] ?? "src");
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return { minPlaces, json, root };
}

function printHelp() {
  console.log(`find-unused — report exported symbols used in < N files

Options:
  --min, -m <n>   Minimum file count to count as used (default: ${MIN_PLACES_DEFAULT})
  --root <dir>    Scan root relative to repo (default: src)
  --json          Print JSON
  --help, -h      Show help
`);
}

function walkFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walkFiles(full, out);
      continue;
    }
    const ext = path.extname(entry.name);
    if (SOURCE_EXTS.has(ext)) out.push(full);
  }

  return out;
}

function stripCommentsAndStrings(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length))
    .replace(/(^|[^:])\/\/.*$/gm, (m) => " ".repeat(m.length))
    .replace(/(['"`])(?:\\.|(?!\1)[\s\S])*\1/g, (m) => " ".repeat(m.length));
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

function classifyExport(
  name: string,
  kindHint: "function" | "const" | "class" | "named",
): ExportKind {
  if (kindHint === "class") return "class";
  // PascalCase React components (not SCREAMING_SNAKE constants)
  if (/^[A-Z][a-zA-Z0-9]*$/.test(name) && !/^[A-Z0-9_]+$/.test(name)) {
    return "component";
  }
  if (kindHint === "named") return "named";
  return kindHint === "const" ? "const" : "function";
}

function extractExports(file: string, source: string): ExportedSymbol[] {
  const base = path.basename(file);
  const isFrameworkEntry = FRAMEWORK_ENTRY_FILES.has(base);
  const cleaned = stripCommentsAndStrings(source);
  const found: ExportedSymbol[] = [];
  const seen = new Set<string>();

  const push = (
    name: string,
    kindHint: "function" | "const" | "class" | "named",
    index: number,
  ) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    found.push({
      name,
      kind: classifyExport(name, kindHint),
      file,
      line: lineNumberAt(source, index),
    });
  };

  // export function Name / export async function Name / export default function Name
  const fnRe =
    /\bexport\s+(?:default\s+)?(?:async\s+)?function\s*\*?\s+([A-Za-z_$][\w$]*)/g;
  for (const match of cleaned.matchAll(fnRe)) {
    if (isFrameworkEntry && match[0].includes("default")) continue;
    push(match[1], "function", match.index ?? 0);
  }

  // export class Name / export default class Name
  const classRe = /\bexport\s+(?:default\s+)?class\s+([A-Za-z_$][\w$]*)/g;
  for (const match of cleaned.matchAll(classRe)) {
    if (isFrameworkEntry && match[0].includes("default")) continue;
    push(match[1], "class", match.index ?? 0);
  }

  // export const/let/var Name =
  const constRe =
    /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=/g;
  for (const match of cleaned.matchAll(constRe)) {
    push(match[1], "const", match.index ?? 0);
  }

  // export default Identifier (skip framework entries)
  const defaultIdRe = /\bexport\s+default\s+([A-Za-z_$][\w$]*)\b/g;
  for (const match of cleaned.matchAll(defaultIdRe)) {
    const name = match[1];
    if (name === "function" || name === "class" || name === "async") continue;
    if (isFrameworkEntry) continue;
    push(name, "named", match.index ?? 0);
  }

  // export { Foo, Bar as Baz }  — skip `export type { ... }`
  const namedBlockRe = /\bexport\s+(\btype\s+)?\{([^}]+)\}/g;
  for (const match of cleaned.matchAll(namedBlockRe)) {
    if (match[1]) continue; // type-only export block
    const body = match[2];
    for (const part of body.split(",")) {
      const cleanedPart = part.trim();
      if (!cleanedPart || cleanedPart.startsWith("type ")) continue;

      const asMatch = cleanedPart.match(
        /^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/,
      );
      if (asMatch) {
        push(asMatch[2], "named", match.index ?? 0);
        continue;
      }

      const idMatch = cleanedPart.match(/^([A-Za-z_$][\w$]*)$/);
      if (idMatch) push(idMatch[1], "named", match.index ?? 0);
    }
  }

  return found;
}

/** Build name → files map with one pass (word-boundary matches). */
function buildNameIndex(files: string[]): Map<string, string[]> {
  const index = new Map<string, Set<string>>();
  const tokenRe = /\b[A-Za-z_$][\w$]*\b/g;

  for (const file of files) {
    let content: string;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const seenInFile = new Set<string>();
    for (const match of content.matchAll(tokenRe)) {
      const name = match[0];
      if (seenInFile.has(name)) continue;
      seenInFile.add(name);

      let set = index.get(name);
      if (!set) {
        set = new Set();
        index.set(name, set);
      }
      set.add(file);
    }
  }

  const out = new Map<string, string[]>();
  for (const [name, set] of index) {
    out.set(name, [...set]);
  }
  return out;
}

function findPlaces(name: string, index: Map<string, string[]>): string[] {
  return index.get(name) ?? [];
}

function rel(file: string): string {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function main() {
  const { minPlaces, json, root } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(root)) {
    console.error(`Scan root not found: ${root}`);
    process.exit(1);
  }

  const files = walkFiles(root);
  const unique = new Map<string, ExportedSymbol>();

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const symbol of extractExports(file, source)) {
      const key = `${symbol.name}::${rel(symbol.file)}`;
      if (!unique.has(key)) unique.set(key, symbol);
    }
  }

  const nameIndex = buildNameIndex(files);
  const unused: UnusedHit[] = [];

  for (const symbol of unique.values()) {
    const places = findPlaces(symbol.name, nameIndex);
    if (places.length < minPlaces) {
      unused.push({
        ...symbol,
        places: places.length,
        files: places.map(rel),
      });
    }
  }

  unused.sort(
    (a, b) =>
      a.name.localeCompare(b.name) || rel(a.file).localeCompare(rel(b.file)),
  );

  if (json) {
    console.log(
      JSON.stringify(
        {
          minPlaces,
          scannedFiles: files.length,
          exportedSymbols: unique.size,
          unusedCount: unused.length,
          unused: unused.map((u) => ({
            name: u.name,
            kind: u.kind,
            definedIn: `${rel(u.file)}:${u.line}`,
            places: u.places,
            files: u.files,
          })),
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Scanned ${files.length} files under ${rel(root) || "."}`);
  console.log(`Found ${unique.size} exported symbols`);
  console.log(
    `Unused (< ${minPlaces} place${minPlaces === 1 ? "" : "s"}): ${unused.length}\n`,
  );

  if (unused.length === 0) {
    console.log("No unused exports found.");
    return;
  }

  const width = Math.max(...unused.map((u) => u.name.length), 4);
  for (const item of unused) {
    const where = `${rel(item.file)}:${item.line}`;
    const placeLabel =
      item.places === 0
        ? "0 files"
        : `${item.places} file${item.places === 1 ? "" : "s"} → ${item.files.join(", ")}`;
    console.log(
      `${item.name.padEnd(width)}  [${item.kind}]  ${where}  (${placeLabel})`,
    );
  }

  console.log(
    `\nRule: export alone does not count as used. Grep \\bName\\b across src; need ≥ ${minPlaces} files.`,
  );
}

main();
