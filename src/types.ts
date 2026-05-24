export interface FigmaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface FigmaPaint {
  type: string;
  color?: FigmaColor;
  opacity?: number;
  visible?: boolean;
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  lineHeightPx?: number;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: FigmaBounds;
  characters?: string;
  children?: FigmaNode[];
  cornerRadius?: number;
  counterAxisAlignItems?: string;
  fills?: FigmaPaint[] | "MIXED";
  itemSpacing?: number;
  layoutMode?: string;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  primaryAxisAlignItems?: string;
  rectangleCornerRadii?: [number, number, number, number];
  strokes?: FigmaPaint[] | "MIXED";
  style?: FigmaTextStyle;
  visible?: boolean;
}

export type RenderNodeKind = "container" | "shape" | "text" | "unknown";

export interface RenderNode {
  id: string;
  className: string;
  children: RenderNode[];
  componentName: string;
  kind: RenderNodeKind;
  name: string;
  source: FigmaNode;
  type: string;
  text?: string;
}

export interface ColorToken {
  cssVariable: string;
  name: string;
  sourceNodeId: string;
  value: string;
}

export interface DimensionToken {
  cssVariable: string;
  name: string;
  sourceNodeId: string;
  value: string;
}

export interface TypographyToken {
  cssVariablePrefix: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  letterSpacing: string;
  lineHeight: string;
  name: string;
  sourceNodeId: string;
}

export interface DesignTokens {
  colors: ColorToken[];
  radii: DimensionToken[];
  spacing: DimensionToken[];
  typography: TypographyToken[];
}

export type GeneratedFiles = Record<string, string>;

export type CleanupMode = "off" | "openai";
