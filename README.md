# figma-react-forge

TypeScript CLI and library for converting Figma REST JSON or exported node JSON into React components, CSS, and design tokens.

## Features

- Accepts full Figma REST file JSON, Figma node API JSON, or direct exported node JSON.
- Optionally fetches Figma JSON with `FIGMA_ACCESS_TOKEN`.
- Emits deterministic React, component CSS, token CSS, and `design-tokens.json`.
- Optional OpenAI cleanup path using a local `OPENAI_API_KEY`; deterministic output is the default and fallback.
- Includes tests for Figma node mapping, token extraction, fetch behavior, cleanup fallback, CLI output, and generated code.

## Install

```bash
npm install
npm run build
```

## CLI Usage

Convert a local Figma JSON export:

```bash
npm run build
node dist/cli.js --input ./figma-node.json --out ./generated --component InvoiceCard
```

Fetch from Figma by file key:

```bash
FIGMA_ACCESS_TOKEN=your_token_here node dist/cli.js --file-key abc123 --node-id 1:2 --out ./generated
```

Use OpenAI cleanup only when a local key is available:

```bash
OPENAI_API_KEY=your_key_here node dist/cli.js --input ./figma-node.json --out ./generated --cleanup openai
```

## Library Usage

```ts
import { convertFigmaJson } from "figma-react-forge";

const files = await convertFigmaJson(figmaJson, {
  componentName: "InvoiceCard"
});
```

## Output

The converter writes:

- `ComponentName.tsx`
- `ComponentName.css`
- `tokens.css`
- `design-tokens.json`
- `index.ts`

## Environment

Copy `.env.example` to a local env file if needed. Do not commit real secrets.

## Development

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run public-surface
```
