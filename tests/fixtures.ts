import type { FigmaNode } from "../src/index.js";

export const exportedFrame = {
  id: "1:2",
  name: "Invoice Card",
  type: "FRAME",
  layoutMode: "VERTICAL",
  itemSpacing: 12,
  paddingBottom: 20,
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 20,
  cornerRadius: 16,
  absoluteBoundingBox: {
    x: 0,
    y: 0,
    width: 320,
    height: 160
  },
  fills: [
    {
      type: "SOLID",
      visible: true,
      color: {
        r: 1,
        g: 1,
        b: 1
      }
    }
  ],
  children: [
    {
      id: "1:3",
      name: "Title",
      type: "TEXT",
      characters: "Invoice #1001",
      style: {
        fontFamily: "Inter",
        fontSize: 24,
        fontWeight: 700,
        lineHeightPx: 30,
        letterSpacing: 0
      },
      fills: [
        {
          type: "SOLID",
          color: {
            r: 0.0588235294,
            g: 0.0901960784,
            b: 0.1647058824
          }
        }
      ]
    },
    {
      id: "1:4",
      name: "Action Button",
      type: "RECTANGLE",
      cornerRadius: 8,
      absoluteBoundingBox: {
        x: 24,
        y: 100,
        width: 120,
        height: 40
      },
      fills: [
        {
          type: "SOLID",
          opacity: 1,
          color: {
            r: 0.1450980392,
            g: 0.3882352941,
            b: 0.9215686275
          }
        }
      ]
    },
    {
      id: "1:5",
      name: "Hidden Note",
      type: "TEXT",
      visible: false,
      characters: "Do not render"
    }
  ]
} satisfies FigmaNode;

export const restFileResponse = {
  name: "Billing Mockup",
  lastModified: "2026-05-24T00:00:00Z",
  document: {
    id: "0:0",
    name: "Document",
    type: "DOCUMENT",
    children: [
      {
        id: "0:1",
        name: "Page 1",
        type: "CANVAS",
        children: [exportedFrame]
      }
    ]
  }
};

export const nodeApiResponse = {
  name: "Billing Mockup",
  nodes: {
    "1:2": {
      document: exportedFrame
    }
  }
};
