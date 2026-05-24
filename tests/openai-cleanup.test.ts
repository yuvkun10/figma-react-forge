import { describe, expect, test } from "vitest";

import { cleanupGeneratedFiles } from "../src/index.js";

describe("OpenAI cleanup fallback", () => {
  test("keeps deterministic files when cleanup is disabled or unavailable", async () => {
    const files = {
      "Widget.tsx": "export function Widget() { return <div />; }\n"
    };

    await expect(cleanupGeneratedFiles(files, { mode: "off" })).resolves.toEqual(files);
    await expect(cleanupGeneratedFiles(files, { mode: "openai" })).resolves.toEqual(files);
  });

  test("accepts a compatible cleanup client and preserves file names", async () => {
    const files = {
      "Widget.tsx": "export function Widget(){return <div/>}\n"
    };

    const cleaned = await cleanupGeneratedFiles(files, {
      apiKey: "local-test-key",
      client: {
        responses: {
          create: async () => ({
            output_text: JSON.stringify({
              files: [
                {
                  path: "Widget.tsx",
                  content: "export function Widget() {\n  return <div />;\n}\n"
                },
                {
                  path: "Unexpected.tsx",
                  content: "ignored"
                }
              ]
            })
          })
        }
      },
      mode: "openai"
    });

    expect(cleaned).toEqual({
      "Widget.tsx": "export function Widget() {\n  return <div />;\n}\n"
    });
  });
});
