import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { runCli } from "../src/index.js";
import { exportedFrame } from "./fixtures.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { force: true, recursive: true })));
  tempDirs.length = 0;
});

describe("CLI", () => {
  test("converts local Figma JSON into React and token files", async () => {
    const root = await mkdtemp(join(tmpdir(), "figma-react-forge-"));
    tempDirs.push(root);

    const inputPath = join(root, "input.json");
    const outDir = join(root, "generated");
    await writeFile(inputPath, JSON.stringify(exportedFrame), "utf8");

    const stdout: string[] = [];
    const stderr: string[] = [];
    const exitCode = await runCli(
      ["node", "figma-react-forge", "--input", inputPath, "--out", outDir, "--component", "BillingCard"],
      {},
      {
        stderr: (line) => stderr.push(line),
        stdout: (line) => stdout.push(line)
      }
    );

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    expect(stdout).toEqual(["Wrote 5 files to " + outDir]);
    await expect(readFile(join(outDir, "BillingCard.tsx"), "utf8")).resolves.toContain("export function BillingCard()");
    await expect(readFile(join(outDir, "tokens.css"), "utf8")).resolves.toContain("--frf-color-title-fill");
    await expect(readFile(join(outDir, "design-tokens.json"), "utf8")).resolves.toContain("title-text");
  });
});
