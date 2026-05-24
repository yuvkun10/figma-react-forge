import { formatNumber, formatPx, slugify } from "./naming.js";
import type { ColorToken, DesignTokens, DimensionToken, FigmaNode, FigmaPaint, TypographyToken } from "./types.js";

export function extractDesignTokens(root: FigmaNode): DesignTokens {
  const colors: ColorToken[] = [];
  const radii: DimensionToken[] = [];
  const spacing: DimensionToken[] = [];
  const typography: TypographyToken[] = [];
  const seen = {
    colors: new Set<string>(),
    radii: new Set<string>(),
    spacing: new Set<string>(),
    typography: new Set<string>()
  };

  walkVisible(root, (node) => {
    for (const paintToken of extractPaintTokens(node)) {
      if (!seen.colors.has(paintToken.value)) {
        seen.colors.add(paintToken.value);
        colors.push(paintToken);
      }
    }

    const radius = extractRadiusToken(node);
    if (radius && !seen.radii.has(radius.value)) {
      seen.radii.add(radius.value);
      radii.push(radius);
    }

    for (const spacingToken of extractSpacingTokens(node)) {
      const key = `${spacingToken.name}:${spacingToken.value}`;
      if (!seen.spacing.has(key)) {
        seen.spacing.add(key);
        spacing.push(spacingToken);
      }
    }

    const typeToken = extractTypographyToken(node);
    if (typeToken) {
      const key = [
        typeToken.fontFamily,
        typeToken.fontSize,
        typeToken.fontWeight,
        typeToken.lineHeight,
        typeToken.letterSpacing
      ].join("|");

      if (!seen.typography.has(key)) {
        seen.typography.add(key);
        typography.push(typeToken);
      }
    }
  });

  return { colors, radii, spacing, typography };
}

export function renderTokensCss(tokens: DesignTokens): string {
  const lines = [":root {"];

  for (const token of tokens.colors) {
    lines.push(`  ${token.cssVariable}: ${token.value};`);
  }

  for (const token of tokens.radii) {
    lines.push(`  ${token.cssVariable}: ${token.value};`);
  }

  for (const token of tokens.spacing) {
    lines.push(`  ${token.cssVariable}: ${token.value};`);
  }

  for (const token of tokens.typography) {
    lines.push(`  ${token.cssVariablePrefix}-font-family: ${token.fontFamily};`);
    lines.push(`  ${token.cssVariablePrefix}-font-size: ${token.fontSize};`);
    lines.push(`  ${token.cssVariablePrefix}-font-weight: ${token.fontWeight};`);
    lines.push(`  ${token.cssVariablePrefix}-line-height: ${token.lineHeight};`);
    lines.push(`  ${token.cssVariablePrefix}-letter-spacing: ${token.letterSpacing};`);
  }

  lines.push("}");

  return `${lines.join("\n")}\n`;
}

export function solidPaintToCss(paint: FigmaPaint): string | undefined {
  if (paint.visible === false || paint.type !== "SOLID" || !paint.color) {
    return undefined;
  }

  const alpha = clampAlpha((paint.color.a ?? 1) * (paint.opacity ?? 1));
  const red = colorChannelToByte(paint.color.r);
  const green = colorChannelToByte(paint.color.g);
  const blue = colorChannelToByte(paint.color.b);

  if (alpha < 1) {
    return `rgba(${red}, ${green}, ${blue}, ${formatNumber(alpha)})`;
  }

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export function firstSolidPaint(fills: FigmaNode["fills"]): FigmaPaint | undefined {
  if (!Array.isArray(fills)) {
    return undefined;
  }

  return fills.find((paint) => solidPaintToCss(paint) !== undefined);
}

function extractPaintTokens(node: FigmaNode): ColorToken[] {
  const tokens: ColorToken[] = [];
  const fill = firstSolidPaint(node.fills);
  const fillValue = fill ? solidPaintToCss(fill) : undefined;

  if (fillValue) {
    const name = `${slugify(node.name)}-fill`;
    tokens.push({
      cssVariable: `--frf-color-${name}`,
      name,
      sourceNodeId: node.id,
      value: fillValue
    });
  }

  return tokens;
}

function extractRadiusToken(node: FigmaNode): DimensionToken | undefined {
  if (!isFiniteNumber(node.cornerRadius) || node.cornerRadius <= 0) {
    return undefined;
  }

  const name = `${slugify(node.name)}-radius`;

  return {
    cssVariable: `--frf-radius-${name}`,
    name,
    sourceNodeId: node.id,
    value: formatPx(node.cornerRadius)
  };
}

function extractSpacingTokens(node: FigmaNode): DimensionToken[] {
  const candidates: Array<[string, number | undefined]> = [
    ["gap", node.itemSpacing],
    ["padding-top", node.paddingTop],
    ["padding-right", node.paddingRight],
    ["padding-bottom", node.paddingBottom],
    ["padding-left", node.paddingLeft]
  ];

  return candidates.flatMap(([suffix, value]) => {
    if (!isFiniteNumber(value) || value <= 0) {
      return [];
    }

    const name = `${slugify(node.name)}-${suffix}`;

    return [
      {
        cssVariable: `--frf-spacing-${name}`,
        name,
        sourceNodeId: node.id,
        value: formatPx(value)
      }
    ];
  });
}

function extractTypographyToken(node: FigmaNode): TypographyToken | undefined {
  if (node.type !== "TEXT" || !node.style) {
    return undefined;
  }

  const fontFamily = node.style.fontFamily;
  const fontSize = node.style.fontSize;
  const fontWeight = node.style.fontWeight;
  const lineHeight = node.style.lineHeightPx;
  const letterSpacing = node.style.letterSpacing;

  if (
    typeof fontFamily !== "string" ||
    !isFiniteNumber(fontSize) ||
    !isFiniteNumber(fontWeight) ||
    !isFiniteNumber(lineHeight) ||
    !isFiniteNumber(letterSpacing)
  ) {
    return undefined;
  }

  const baseName = slugify(node.name);

  return {
    cssVariablePrefix: `--frf-type-${baseName}`,
    fontFamily,
    fontSize: formatPx(fontSize),
    fontWeight,
    letterSpacing: formatPx(letterSpacing),
    lineHeight: formatPx(lineHeight),
    name: `${baseName}-text`,
    sourceNodeId: node.id
  };
}

function walkVisible(node: FigmaNode, visit: (node: FigmaNode) => void): void {
  if (node.visible === false) {
    return;
  }

  visit(node);

  for (const child of node.children ?? []) {
    walkVisible(child, visit);
  }
}

function colorChannelToByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value * 255)));
}

function clampAlpha(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}
