# Usage

## Who it is for

`figma-react-forge` is for frontend engineers, design system teams, prototypers and product teams that need a deterministic starting point from real Figma structure without turning a design file into an opaque runtime dependency.

## Use cases

- Turn a Figma frame into a React proof of concept that can be reviewed in a real app.
- Extract color, radius, spacing and typography tokens while keeping links back to source node IDs.
- Bootstrap design system component work from current design files, then refactor by hand.
- Produce frontend fixtures for visual prototyping, implementation spikes and design QA.
- Fetch a file or a specific node directly from Figma when local JSON exports are not convenient.

## CLI

Convert a local JSON export:

```bash
npm run build
node dist/cli.js --input ./figma-node.json --out ./generated --component InvoiceCard
```

Fetch a file from Figma:

```bash
FIGMA_ACCESS_TOKEN=your_token_here node dist/cli.js --file-key abc123 --out ./generated
```

Fetch a specific node from Figma:

```bash
FIGMA_ACCESS_TOKEN=your_token_here node dist/cli.js --file-key abc123 --node-id 1:2 --out ./generated
```

Run optional OpenAI cleanup:

```bash
OPENAI_API_KEY=your_key_here node dist/cli.js --input ./figma-node.json --out ./generated --cleanup openai
```

## Library

```ts
import { convertFigmaJson } from "figma-react-forge";

const files = await convertFigmaJson(figmaJson, {
  componentName: "InvoiceCard"
});
```

Fetch JSON yourself if you need custom auth, caching, rate limit handling or a file access policy. Pass the parsed JSON into `convertFigmaJson`.

## Output

For a component named `InvoiceCard`, the CLI writes:

- `InvoiceCard.tsx`
- `InvoiceCard.css`
- `tokens.css`
- `design-tokens.json`
- `index.ts`

Token extraction currently covers:

- Solid fill colors as `--frf-color-*`
- Corner radii as `--frf-radius-*`
- Auto-layout gap and padding values as `--frf-spacing-*`
- Text style values as `--frf-type-*`

Renderer output currently covers:

- React function components with source `data-figma-id` attributes.
- Text nodes rendered as `<span>`.
- Shape and leaf nodes rendered as `<div aria-hidden="true" />`.
- Container nodes rendered as nested `<div>` elements.
- Width, minimum height, flex direction, gap, padding, background, color, radius and typography declarations where those values exist in the Figma JSON.

## Commands

```bash
npm run audit
npm run outdated
npm run lint
npm run typecheck
npm test
npm run build
npm run public-surface
```

`npm run audit` fails on vulnerabilities of moderate severity or higher. `npm run outdated` reports packages where the installed version is behind the registry. CI runs both before lint, typecheck, tests, build and the public surface check.
