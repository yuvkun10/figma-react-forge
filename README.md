# figma-react-forge

A TypeScript CLI and library that converts Figma REST API JSON, Figma node API JSON or exported node JSON into a small React component package: a TSX component, component CSS, CSS custom property tokens and a `design-tokens.json` file. It is for frontend engineers and design system teams who want a deterministic starting point from real Figma structure. Status: version 0.1.0, run from a local build.

## Installation

Prerequisites:

- Node.js `20.19+`, `22.13+` or `24+`
- npm

```bash
npm install
npm run build
```

Use `npm ci` for repeatable installs, as CI does.

Environment variables are optional. Copy `.env.example` to `.env.local` and keep real secrets out of Git.

- `FIGMA_ACCESS_TOKEN`: only needed with `--file-key`
- `OPENAI_API_KEY`: only needed with `--cleanup openai`
- `OPENAI_MODEL`: leave blank to use the package default cleanup model

Details are in [docs/configuration.md](docs/configuration.md).

## Usage

Convert a local JSON export:

```bash
npm run build
node dist/cli.js --input ./figma-node.json --out ./generated --component InvoiceCard
```

Fetch a file or a single node from Figma (needs `FIGMA_ACCESS_TOKEN` in `.env.local`):

```bash
node dist/cli.js --file-key abc123 --out ./generated
node dist/cli.js --file-key abc123 --node-id 1:2 --out ./generated
```

Use it as a library:

```ts
import { convertFigmaJson } from "figma-react-forge";

const files = await convertFigmaJson(figmaJson, {
  componentName: "InvoiceCard"
});
```

More CLI examples, the optional OpenAI cleanup and the list of output files are in [docs/usage.md](docs/usage.md). The tool runs locally and has no deployment.

## Project structure

```text
├── .github
│   └── workflows
├── docs
│   ├── architecture.md
│   └── archive
├── scripts
│   └── check-public-surface.mjs
├── src
│   ├── cli.ts
│   ├── converter.ts
│   ├── figma-api.ts
│   ├── index.ts
│   ├── input.ts
│   ├── mapper.ts
│   ├── naming.ts
│   ├── openai-cleanup.ts
│   ├── render.ts
│   ├── tokens.ts
│   └── types.ts
├── tests
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

What each module does is in [docs/architecture.md](docs/architecture.md).

## Coding style

- ESLint flat config (`eslint.config.js`) with `@eslint/js` recommended and `typescript-eslint` strict rules. Run `npm run lint`.
- TypeScript `strict`, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Run `npm run typecheck`.
- `npm run public-surface` fails if env files, private workflow files, common API key patterns or attribution wording are tracked.
- No formatter or commit message convention is configured.

## Test

```bash
npm test
```

Vitest runs the suites in `tests/`: mapping, tokens, rendering, CLI, Figma API and OpenAI cleanup. CI runs `npm run audit`, `npm run outdated`, lint, typecheck, tests, build and the public surface check on every push to `main` and every pull request.

## Documentation

- [docs/README.md](docs/README.md): index of all docs
- [docs/architecture.md](docs/architecture.md): pipeline, diagram, module map
- [docs/usage.md](docs/usage.md): use cases, CLI and library usage, output, commands
- [docs/configuration.md](docs/configuration.md): environment variables
- [docs/security.md](docs/security.md): privacy and security notes

## License

MIT. See [LICENSE](LICENSE).
