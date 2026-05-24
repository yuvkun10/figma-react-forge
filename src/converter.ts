import { cleanupGeneratedFiles, type CleanupGeneratedFilesOptions } from "./openai-cleanup.js";
import { renderComponentFiles, type RenderComponentOptions } from "./render.js";
import type { CleanupMode, GeneratedFiles } from "./types.js";

export interface ConvertFigmaJsonOptions extends RenderComponentOptions {
  cleanup?: CleanupMode;
  openAiApiKey?: string;
  openAiClient?: CleanupGeneratedFilesOptions["client"];
  openAiModel?: string;
}

export async function convertFigmaJson(input: unknown, options: ConvertFigmaJsonOptions = {}): Promise<GeneratedFiles> {
  const deterministicFiles = renderComponentFiles(input, options);
  const cleanupOptions: CleanupGeneratedFilesOptions = {
    mode: options.cleanup ?? "off"
  };

  if (options.openAiApiKey) {
    cleanupOptions.apiKey = options.openAiApiKey;
  }
  if (options.openAiClient) {
    cleanupOptions.client = options.openAiClient;
  }
  if (options.openAiModel) {
    cleanupOptions.model = options.openAiModel;
  }

  return cleanupGeneratedFiles(deterministicFiles, cleanupOptions);
}
