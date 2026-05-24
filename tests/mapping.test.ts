import { describe, expect, test } from "vitest";

import { extractFigmaRoot, mapFigmaNode } from "../src/index.js";
import { exportedFrame, nodeApiResponse, restFileResponse } from "./fixtures.js";

describe("Figma node mapping", () => {
  test("extracts a root node from REST file JSON, node API JSON, and exported node JSON", () => {
    expect(extractFigmaRoot(restFileResponse).name).toBe("Document");
    expect(extractFigmaRoot(nodeApiResponse, "1:2").name).toBe("Invoice Card");
    expect(extractFigmaRoot(exportedFrame).name).toBe("Invoice Card");
  });

  test("normalizes Figma nodes into deterministic render nodes and omits hidden nodes", () => {
    const mapped = mapFigmaNode(exportedFrame);

    expect(mapped).toMatchObject({
      id: "1:2",
      name: "Invoice Card",
      componentName: "InvoiceCard",
      className: "frf-invoice-card-1-2",
      kind: "container"
    });
    expect(mapped.children.map((child) => child.kind)).toEqual(["text", "shape"]);
    expect(mapped.children.map((child) => child.name)).not.toContain("Hidden Note");
    expect(mapped.children[0]).toMatchObject({
      className: "frf-title-1-3",
      text: "Invoice #1001"
    });
  });
});
