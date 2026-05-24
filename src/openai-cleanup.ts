import OpenAI from "openai";

import type { CleanupMode, GeneratedFiles } from "./types.js";

export interface OpenAiCleanupClient {
  responses: {
    create(params: Record<string, unknown>): Promise<{
      output_text?: string | null;
    }>;
  };
}

export interface CleanupGeneratedFilesOptions {
  apiKey?: string;
  client?: OpenAiCleanupClient;
  mode?: CleanupMode;
  model?: string;
}

export async function cleanupGeneratedFiles(
  files: GeneratedFiles,
  options: CleanupGeneratedFilesOptions = {}
): Promise<GeneratedFiles> {
  if (options.mode !== "openai") {
    return files;
  }

  const apiKey = options.apiKey ?? process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    return files;
  }

  try {
    const client = options.client ?? (new OpenAI({ apiKey }) as unknown as OpenAiCleanupClient);
    const response = await client.responses.create({
      input: buildCleanupPrompt(files),
      instructions: [
        "Clean up generated React and CSS files without changing filenames or behavior.",
        "Keep output deterministic and production-ready.",
        "Return JSON matching the schema exactly."
      ].join(" "),
      model: options.model ?? process.env["OPENAI_MODEL"] ?? "gpt-5.5",
      text: {
        format: {
          name: "figma_react_forge_files",
          schema: cleanupSchema,
          strict: true,
          type: "json_schema"
        }
      }
    });

    return mergeCleanedFiles(files, response.output_text);
  } catch {
    return files;
  }
}

function buildCleanupPrompt(files: GeneratedFiles): string {
  return JSON.stringify({
    files: Object.entries(files).map(([path, content]) => ({ content, path }))
  });
}

function mergeCleanedFiles(original: GeneratedFiles, outputText: string | null | undefined): GeneratedFiles {
  if (!outputText) {
    return original;
  }

  try {
    const parsed = JSON.parse(outputText) as {
      files?: Array<{
        content?: unknown;
        path?: unknown;
      }>;
    };
    const cleaned = new Map(
      (parsed.files ?? [])
        .filter((file) => typeof file.path === "string" && typeof file.content === "string")
        .map((file) => [file.path as string, file.content as string])
    );
    const merged: GeneratedFiles = {};

    for (const [path, content] of Object.entries(original)) {
      merged[path] = cleaned.get(path) ?? content;
    }

    return merged;
  } catch {
    return original;
  }
}

const cleanupSchema = {
  additionalProperties: false,
  properties: {
    files: {
      items: {
        additionalProperties: false,
        properties: {
          content: {
            type: "string"
          },
          path: {
            type: "string"
          }
        },
        required: ["path", "content"],
        type: "object"
      },
      type: "array"
    }
  },
  required: ["files"],
  type: "object"
};
