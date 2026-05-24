import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

const forbiddenTracked = [
  "AGENTS.md",
  ".codex/",
  "Obsidian/",
  ".env",
  ".env.local"
];

const violations = [];
const attributionPattern = new RegExp(
  [
    ["generated", "by"].join(" "),
    ["co", "authored", "by"].join("-"),
    ["assistant", "attribution"].join(" ")
  ].join("|"),
  "i"
);

for (const file of trackedFiles) {
  if (file === ".env.example") {
    continue;
  }

  if (forbiddenTracked.some((entry) => file === entry || file.startsWith(entry))) {
    violations.push(`private workflow file is tracked: ${file}`);
  }

  if (/^\.env\./.test(file)) {
    violations.push(`env file is tracked: ${file}`);
  }
}

for (const file of trackedFiles.filter((name) => /\.(?:md|ts|js|mjs|json|yml|yaml)$/.test(name))) {
  const content = readFileSync(file, "utf8");

  if (attributionPattern.test(content)) {
    violations.push(`disallowed attribution wording found in ${file}`);
  }

  if (/\bsk-[A-Za-z0-9_-]{16,}\b/.test(content)) {
    violations.push(`possible API key found in ${file}`);
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log(`Public surface check passed for ${trackedFiles.length} tracked files.`);
