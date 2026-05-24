import { describe, expect, test } from "vitest";

import { renderComponentFiles } from "../src/index.js";
import { exportedFrame } from "./fixtures.js";

describe("React renderer", () => {
  test("emits deterministic React, CSS, token, and barrel files", () => {
    const first = renderComponentFiles(exportedFrame, { componentName: "BillingCard" });
    const second = renderComponentFiles(exportedFrame, { componentName: "BillingCard" });

    expect(second).toEqual(first);
    expect(Object.keys(first)).toEqual([
      "BillingCard.tsx",
      "BillingCard.css",
      "tokens.css",
      "design-tokens.json",
      "index.ts"
    ]);
    expect(first["BillingCard.tsx"]).toContain("export function BillingCard()");
    expect(first["BillingCard.tsx"]).toContain("Invoice #1001");
    expect(first["BillingCard.css"]).toContain("@import \"./tokens.css\";");
    expect(first["BillingCard.css"]).toContain(".frf-invoice-card-1-2");
    expect(first["BillingCard.css"]).toContain("background: var(--frf-color-action-button-fill);");
    expect(first["tokens.css"]).toContain(":root");
    expect(JSON.parse(first["design-tokens.json"]!)).toHaveProperty("colors");
    expect(first["index.ts"]).toBe("export { BillingCard } from \"./BillingCard.js\";\n");
  });
});
