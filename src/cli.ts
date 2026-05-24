#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { config as dotenvConfig } from "dotenv";

import { convertFigmaJson, type ConvertFigmaJsonOptions } from "./converter.js";
import { fetchFigmaJson, type FetchFigmaJsonOptions } from "./figma-api.js";
import type { CleanupMode, GeneratedFiles } from "./types.js";

export interface CliIo {
  stderr(line: string): void;
  stdout(line: string): void;
}

export async function runCli(
  argv = process.argv,
  env: NodeJS.ProcessEnv = process.env,
  io: CliIo = {
    stderr: (line) => console.error(line),
    stdout: (line) => console.log(line)
  }
): Promise<number> {
  loadLocalEnv(process.cwd());
  const effectiveEnv = { ...process.env, ...env };

  try {
    const parsed = parseArgs({
      allowPositionals: false,
      args: argv.slice(2),
      options: {
        cleanup: { default: "off", type: "string" },
        component: { type: "string" },
        "file-key": { type: "string" },
        help: { short: "h", type: "boolean" },
        input: { short: "i", type: "string" },
        "node-id": { type: "string" },
        out: { short: "o", type: "string" },
        version: { short: "v", type: "boolean" }
      },
      strict: true
    });

    if (parsed.values.help) {
      io.stdout(helpText);
      return 0;
    }

    if (parsed.values.version) {
      io.stdout("0.1.0");
      return 0;
    }

    const cleanup = readCleanupMode(parsed.values.cleanup);
    const outDir = parsed.values.out;
    if (!outDir) {
      throw new Error("Missing required --out directory.");
    }

    const input = await readInputJson(parsed.values.input, parsed.values["file-key"], parsed.values["node-id"], effectiveEnv);
    const convertOptions: ConvertFigmaJsonOptions = { cleanup };
    if (parsed.values.component) {
      convertOptions.componentName = parsed.values.component;
    }
    if (parsed.values["node-id"]) {
      convertOptions.nodeId = parsed.values["node-id"];
    }
    if (effectiveEnv["OPENAI_API_KEY"]) {
      convertOptions.openAiApiKey = effectiveEnv["OPENAI_API_KEY"];
    }
    if (effectiveEnv["OPENAI_MODEL"]) {
      convertOptions.openAiModel = effectiveEnv["OPENAI_MODEL"];
    }

    const files = await convertFigmaJson(input, convertOptions);
    const written = await writeGeneratedFiles(files, outDir);

    io.stdout(`Wrote ${written.length} files to ${outDir}`);
    return 0;
  } catch (error) {
    io.stderr(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

export async function writeGeneratedFiles(files: GeneratedFiles, outDir: string): Promise<string[]> {
  await mkdir(outDir, { recursive: true });

  const written: string[] = [];
  for (const [path, content] of Object.entries(files)) {
    await writeFile(join(outDir, path), content, "utf8");
    written.push(path);
  }

  return written;
}

function loadLocalEnv(cwd: string): void {
  dotenvConfig({ override: false, path: join(cwd, ".env.local"), quiet: true });
  dotenvConfig({ override: false, path: join(cwd, ".env"), quiet: true });
}

async function readInputJson(
  inputPath: string | undefined,
  fileKey: string | undefined,
  nodeId: string | undefined,
  env: NodeJS.ProcessEnv
): Promise<unknown> {
  if (inputPath) {
    return JSON.parse(await readFile(inputPath, "utf8")) as unknown;
  }

  if (fileKey) {
    const fetchOptions: FetchFigmaJsonOptions = { fileKey };
    if (nodeId) {
      fetchOptions.nodeId = nodeId;
    }
    if (env["FIGMA_ACCESS_TOKEN"]) {
      fetchOptions.token = env["FIGMA_ACCESS_TOKEN"];
    }

    return fetchFigmaJson(fetchOptions);
  }

  throw new Error("Provide either --input or --file-key.");
}

function readCleanupMode(value: string | boolean | undefined): CleanupMode {
  if (value === undefined || value === "off") {
    return "off";
  }

  if (value === "openai") {
    return "openai";
  }

  throw new Error("--cleanup must be either off or openai.");
}

const helpText = [
  "figma-react-forge",
  "",
  "Usage:",
  "  figma-react-forge --input figma.json --out generated --component InvoiceCard",
  "  figma-react-forge --file-key abc123 --node-id 1:2 --out generated",
  "",
  "Options:",
  "  -i, --input <path>       Local Figma REST JSON or exported node JSON",
  "  -o, --out <dir>          Output directory",
  "      --file-key <key>     Figma file key for REST fetch",
  "      --node-id <id>       Optional Figma node id",
  "      --component <name>   React component name override",
  "      --cleanup <mode>     off or openai",
  "  -h, --help               Show help"
].join("\n");

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const exitCode = await runCli();
  process.exitCode = exitCode;
}
