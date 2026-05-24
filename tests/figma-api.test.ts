import { describe, expect, test } from "vitest";

import { buildFigmaApiUrl, fetchFigmaJson } from "../src/index.js";
import { exportedFrame } from "./fixtures.js";

describe("Figma REST fetch", () => {
  test("builds file and node API URLs deterministically", () => {
    expect(buildFigmaApiUrl({ fileKey: "abc123" })).toBe("https://api.figma.com/v1/files/abc123");
    expect(buildFigmaApiUrl({ fileKey: "abc123", nodeId: "1:2" })).toBe(
      "https://api.figma.com/v1/files/abc123/nodes?ids=1%3A2"
    );
  });

  test("uses FIGMA_ACCESS_TOKEN-compatible authentication without logging secrets", async () => {
    const calls: Array<{ headers: HeadersInit; url: string }> = [];
    const json = {
      nodes: {
        "1:2": {
          document: exportedFrame
        }
      }
    };
    const fakeFetch: typeof fetch = async (url, init) => {
      calls.push({ headers: init?.headers ?? {}, url: String(url) });

      return new Response(JSON.stringify(json), {
        headers: {
          "content-type": "application/json"
        },
        status: 200
      });
    };

    await expect(
      fetchFigmaJson({
        fetch: fakeFetch,
        fileKey: "abc123",
        nodeId: "1:2",
        token: "figma_test_token"
      })
    ).resolves.toEqual(json);
    expect(calls).toEqual([
      {
        headers: {
          "X-Figma-Token": "figma_test_token"
        },
        url: "https://api.figma.com/v1/files/abc123/nodes?ids=1%3A2"
      }
    ]);
  });
});
