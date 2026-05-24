import { describe, expect, test } from "vitest";

import { extractDesignTokens, renderTokensCss } from "../src/index.js";
import { exportedFrame } from "./fixtures.js";

describe("design token extraction", () => {
  test("extracts deterministic color, typography, radius, and spacing tokens", () => {
    const tokens = extractDesignTokens(exportedFrame);

    expect(tokens.colors.map((token) => [token.name, token.value])).toEqual([
      ["invoice-card-fill", "#ffffff"],
      ["title-fill", "#0f172a"],
      ["action-button-fill", "#2563eb"]
    ]);
    expect(tokens.typography).toEqual([
      {
        cssVariablePrefix: "--frf-type-title",
        fontFamily: "Inter",
        fontSize: "24px",
        fontWeight: 700,
        letterSpacing: "0px",
        lineHeight: "30px",
        name: "title-text",
        sourceNodeId: "1:3"
      }
    ]);
    expect(tokens.radii.map((token) => [token.name, token.value])).toEqual([
      ["invoice-card-radius", "16px"],
      ["action-button-radius", "8px"]
    ]);
    expect(tokens.spacing.map((token) => [token.name, token.value])).toEqual([
      ["invoice-card-gap", "12px"],
      ["invoice-card-padding-top", "20px"],
      ["invoice-card-padding-right", "24px"],
      ["invoice-card-padding-bottom", "20px"],
      ["invoice-card-padding-left", "24px"]
    ]);
  });

  test("renders token CSS variables in stable order", () => {
    const css = renderTokensCss(extractDesignTokens(exportedFrame));

    expect(css).toContain("--frf-color-action-button-fill: #2563eb;");
    expect(css).toContain("--frf-radius-invoice-card-radius: 16px;");
    expect(css).toContain("--frf-type-title-font-family: Inter;");
    expect(css.indexOf("--frf-color-invoice-card-fill")).toBeLessThan(css.indexOf("--frf-type-title-font-family"));
  });
});
