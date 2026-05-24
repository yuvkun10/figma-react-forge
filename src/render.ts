import { extractFigmaRoot } from "./input.js";
import { formatPx, toPascalCase } from "./naming.js";
import { mapFigmaNode } from "./mapper.js";
import { extractDesignTokens, firstSolidPaint, renderTokensCss, solidPaintToCss } from "./tokens.js";
import type { DesignTokens, FigmaNode, GeneratedFiles, RenderNode, TypographyToken } from "./types.js";

export interface RenderComponentOptions {
  componentName?: string;
  nodeId?: string;
}

export function renderComponentFiles(input: unknown, options: RenderComponentOptions = {}): GeneratedFiles {
  const root = extractFigmaRoot(input, options.nodeId);
  const componentName = toPascalCase(options.componentName ?? root.name);
  const mapped = mapFigmaNode(root, { componentName });
  const tokens = extractDesignTokens(root);

  return {
    [`${componentName}.tsx`]: renderComponent(mapped, componentName),
    [`${componentName}.css`]: renderComponentCss(mapped, tokens),
    "tokens.css": renderTokensCss(tokens),
    "design-tokens.json": `${JSON.stringify(tokens, null, 2)}\n`,
    "index.ts": `export { ${componentName} } from "./${componentName}.js";\n`
  };
}

function renderComponent(root: RenderNode, componentName: string): string {
  return [
    `import "./${componentName}.css";`,
    "",
    `export function ${componentName}() {`,
    "  return (",
    renderNode(root, 4),
    "  );",
    "}",
    ""
  ].join("\n");
}

function renderNode(node: RenderNode, indent: number): string {
  const pad = " ".repeat(indent);
  const attributes = `className="${node.className}" data-figma-id="${escapeAttribute(node.id)}"`;

  if (node.kind === "text") {
    return `${pad}<span ${attributes}>{${JSON.stringify(node.text ?? "")}}</span>`;
  }

  if (node.kind === "shape" || node.children.length === 0) {
    return `${pad}<div ${attributes} aria-hidden="true" />`;
  }

  return [
    `${pad}<div ${attributes}>`,
    ...node.children.map((child) => renderNode(child, indent + 2)),
    `${pad}</div>`
  ].join("\n");
}

function renderComponentCss(root: RenderNode, tokens: DesignTokens): string {
  const rules = flattenRenderTree(root).map((node) => renderCssRule(node, tokens));

  return [`@import "./tokens.css";`, "", ...rules].join("\n\n") + "\n";
}

function renderCssRule(node: RenderNode, tokens: DesignTokens): string {
  const declarations = ["box-sizing: border-box;"];
  const source = node.source;

  if (source.absoluteBoundingBox) {
    declarations.push(`width: ${formatPx(source.absoluteBoundingBox.width)};`);
    declarations.push(`min-height: ${formatPx(source.absoluteBoundingBox.height)};`);
  }

  if (node.kind === "container") {
    declarations.push(...layoutDeclarations(source, tokens));
  }

  const fill = firstSolidPaint(source.fills);
  const fillValue = fill ? solidPaintToCss(fill) : undefined;
  const colorToken = fillValue ? tokens.colors.find((token) => token.value === fillValue) : undefined;

  if (colorToken && node.kind === "text") {
    declarations.push(`color: var(${colorToken.cssVariable});`);
  } else if (colorToken) {
    declarations.push(`background: var(${colorToken.cssVariable});`);
  }

  const radius = tokens.radii.find((token) => token.sourceNodeId === source.id);
  if (radius) {
    declarations.push(`border-radius: var(${radius.cssVariable});`);
  }

  const typography = tokens.typography.find((token) => token.sourceNodeId === source.id);
  if (typography) {
    declarations.push(...typographyDeclarations(typography));
  }

  return [`.${node.className} {`, ...declarations.map((line) => `  ${line}`), "}"].join("\n");
}

function layoutDeclarations(node: FigmaNode, tokens: DesignTokens): string[] {
  const declarations: string[] = [];

  if (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL") {
    declarations.push("display: flex;");
    declarations.push(`flex-direction: ${node.layoutMode === "HORIZONTAL" ? "row" : "column"};`);
  }

  const gap = tokens.spacing.find((token) => token.sourceNodeId === node.id && token.name.endsWith("-gap"));
  if (gap) {
    declarations.push(`gap: var(${gap.cssVariable});`);
  }

  for (const side of ["top", "right", "bottom", "left"] as const) {
    const padding = tokens.spacing.find((token) => token.sourceNodeId === node.id && token.name.endsWith(`-padding-${side}`));
    if (padding) {
      declarations.push(`padding-${side}: var(${padding.cssVariable});`);
    }
  }

  return declarations;
}

function typographyDeclarations(token: TypographyToken): string[] {
  return [
    `font-family: var(${token.cssVariablePrefix}-font-family);`,
    `font-size: var(${token.cssVariablePrefix}-font-size);`,
    `font-weight: var(${token.cssVariablePrefix}-font-weight);`,
    `line-height: var(${token.cssVariablePrefix}-line-height);`,
    `letter-spacing: var(${token.cssVariablePrefix}-letter-spacing);`
  ];
}

function flattenRenderTree(root: RenderNode): RenderNode[] {
  return [root, ...root.children.flatMap((child) => flattenRenderTree(child))];
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
