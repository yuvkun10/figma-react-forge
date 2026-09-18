# Configuration

Copy `.env.example` to `.env.local` for local use. Keep real secrets out of Git.

| Variable | Required | Purpose |
| --- | --- | --- |
| `FIGMA_ACCESS_TOKEN` | Only with `--file-key` | Authenticates requests to the Figma REST API |
| `OPENAI_API_KEY` | Only with `--cleanup openai` | Enables the optional cleanup step |
| `OPENAI_MODEL` | No | Cleanup model. Leave blank to use the package default |

`FIGMA_ACCESS_TOKEN`: use a token with the narrowest available Figma file read scope for your account. Revoke it if it is exposed or no longer needed.

`OPENAI_API_KEY`: leave it unset for fully deterministic local generation.
