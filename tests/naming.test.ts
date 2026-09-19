import { describe, expect, test } from "vitest";

import { classNameFor, slugify, toPascalCase } from "../src/naming.js";

describe("naming helpers", () => {
  test("slugifies names and trims hyphens at both ends", () => {
    expect(slugify("  Invoice Card / Primary  ")).toBe("invoice-card-primary");
    expect(slugify("--Button--")).toBe("button");
    expect(slugify("1:23")).toBe("1-23");
    expect(slugify("!!!")).toBe("node");
    expect(slugify("", "fallback")).toBe("fallback");
    expect(classNameFor("Action Button", "1:4")).toBe("frf-action-button-1-4");
    expect(toPascalCase("invoice card-title")).toBe("InvoiceCardTitle");
    expect(toPascalCase("--")).toBe("FigmaComponent");
  });

  test("handles long runs of separators quickly", () => {
    const hyphens = "-".repeat(100_000);
    const input = `${hyphens}a${hyphens}b${"-a".repeat(50_000)}!`;

    const started = performance.now();
    const slug = slugify(input);
    const pascal = toPascalCase(input);

    expect(performance.now() - started).toBeLessThan(1000);
    expect(slug).toBe(`a-b${"-a".repeat(50_000)}`);
    expect(pascal).toBe(`AB${"A".repeat(50_000)}`);
  });
});
