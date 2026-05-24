import { classNameFor, toPascalCase } from "./naming.js";
import type { FigmaNode, RenderNode, RenderNodeKind } from "./types.js";

export interface MapFigmaNodeOptions {
  componentName?: string;
}

const containerTypes = new Set(["BOOLEAN_OPERATION", "CANVAS", "COMPONENT", "DOCUMENT", "FRAME", "GROUP", "INSTANCE", "SECTION"]);
const shapeTypes = new Set(["ELLIPSE", "LINE", "POLYGON", "RECTANGLE", "STAR", "VECTOR"]);

export function mapFigmaNode(node: FigmaNode, options: MapFigmaNodeOptions = {}): RenderNode {
  const kind = kindForNode(node);
  const children = (node.children ?? [])
    .filter((child) => child.visible !== false)
    .map((child) => mapFigmaNode(child));

  const mapped: RenderNode = {
    id: node.id,
    className: classNameFor(node.name, node.id),
    children,
    componentName: options.componentName ?? toPascalCase(node.name),
    kind,
    name: node.name,
    source: node,
    type: node.type
  };

  if (kind === "text") {
    mapped.text = node.characters ?? "";
  }

  return mapped;
}

function kindForNode(node: FigmaNode): RenderNodeKind {
  if (node.type === "TEXT") {
    return "text";
  }

  if (shapeTypes.has(node.type)) {
    return "shape";
  }

  if (containerTypes.has(node.type) || (node.children?.length ?? 0) > 0) {
    return "container";
  }

  return "unknown";
}
