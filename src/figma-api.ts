export interface FigmaApiUrlOptions {
  fileKey: string;
  nodeId?: string;
}

export interface FetchFigmaJsonOptions extends FigmaApiUrlOptions {
  fetch?: typeof fetch;
  token?: string;
}

export function buildFigmaApiUrl(options: FigmaApiUrlOptions): string {
  const fileUrl = `https://api.figma.com/v1/files/${encodeURIComponent(options.fileKey)}`;

  if (!options.nodeId) {
    return fileUrl;
  }

  return `${fileUrl}/nodes?ids=${encodeURIComponent(options.nodeId)}`;
}

export async function fetchFigmaJson(options: FetchFigmaJsonOptions): Promise<unknown> {
  const token = options.token ?? process.env["FIGMA_ACCESS_TOKEN"];
  if (!token) {
    throw new Error("FIGMA_ACCESS_TOKEN is required when fetching from Figma.");
  }

  const fetcher = options.fetch ?? fetch;
  const response = await fetcher(buildFigmaApiUrl(options), {
    headers: {
      "X-Figma-Token": token
    }
  });

  if (!response.ok) {
    throw new Error(`Figma API request failed with HTTP ${response.status}.`);
  }

  return response.json();
}
