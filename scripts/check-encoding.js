const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const IGNORE_DIRS = new Set([
  ".git",
  ".idea",
  ".claude",
  "node_modules",
  "public_html/assets",
]);
const TEXT_EXTS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".php",
  ".html",
  ".md",
  ".css",
  ".json",
  ".yml",
  ".yaml",
  ".txt",
  ".env",
]);
const TEXT_NAMES = new Set(["AGENTS.md", "README", "LICENSE", "CHANGELOG"]);
const PATTERNS = [
  { name: "replacement character", re: /\uFFFD/ },
  { name: "utf8 snowman/mojibake", re: /\u00F0\u0178/ },
  { name: "broken accent", re: /Ã[\x80-\xBF]/ },
  { name: "broken punctuation", re: /â(?:€|†|ˆ|œ|š|•|”|–|—)/ },
];

function shouldScan(filePath) {
  const rel = path.relative(ROOT, filePath);
  if (!rel || rel.startsWith("..")) return false;
  const parts = rel.split(path.sep);
  if (parts.some(part => IGNORE_DIRS.has(part))) return false;
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTS.has(ext) || TEXT_NAMES.has(path.basename(filePath));
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && shouldScan(full)) {
      out.push(full);
    }
  }
  return out;
}

function findSuspicious(content) {
  return PATTERNS.filter(({ re }) => re.test(content));
}

const files = walk(ROOT);
const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const suspicious = findSuspicious(content);
  if (!suspicious.length) continue;
  const rel = path.relative(ROOT, file);
  const lines = content.split(/\r?\n/);
  const matches = [];

  lines.forEach((line, index) => {
    for (const pattern of suspicious) {
      if (pattern.re.test(line)) {
        matches.push(`${index + 1}: ${pattern.name} -> ${line.trim()}`);
        break;
      }
    }
  });

  issues.push({ rel, matches });
}

if (issues.length) {
  console.error("Encoding check failed. Suspicious text found:");
  for (const issue of issues) {
    console.error(`\n${issue.rel}`);
    for (const match of issue.matches.slice(0, 10)) {
      console.error(`  ${match}`);
    }
    if (issue.matches.length > 10) {
      console.error(`  ... ${issue.matches.length - 10} more`);
    }
  }
  process.exit(1);
}

console.log(`Encoding check passed for ${files.length} text files.`);
