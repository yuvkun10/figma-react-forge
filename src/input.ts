import type { FigmaNode } from "./types.js";

export function extractFigmaRoot(input: unknown, nodeId?: string): FigmaNode {
  if (isFigmaNode(input)) {
    return input;
  }

  if (!isRecord(input)) {
    throw new Error("Figma input must be an object.");
  }

  const document = input["document"];
  if (isFigmaNode(document)) {
    return document;
  }

  const nodes = input["nodes"];
  if (isRecord(nodes)) {
    const selected = selectNodeApiEntry(nodes, nodeId);
    const selectedDocument = selected["document"];

    if (isFigmaNode(selectedDocument)) {
      return selectedDocument;
    }
  }

  throw new Error("Could not find a Figma document or node in the provided JSON.");
}

function selectNodeApiEntry(nodes: Record<string, unknown>, nodeId?: string): Record<string, unknown> {
  if (nodeId) {
    const selected = nodes[nodeId];
    if (isRecord(selected)) {
      return selected;
    }

    throw new Error(`Figma node "${nodeId}" was not found in the node API response.`);
  }

  const first = Object.values(nodes).find(isRecord);
  if (first) {
    return first;
  }

  throw new Error("Figma node API response did not contain any nodes.");
}

export function isFigmaNode(value: unknown): value is FigmaNode {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    typeof value["name"] === "string" &&
    typeof value["type"] === "string"
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
