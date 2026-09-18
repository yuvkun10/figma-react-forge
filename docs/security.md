# Privacy and security

- Do not commit `.env`, `.env.local`, Figma tokens, OpenAI keys, private design exports or local workflow notes.
- Treat Figma JSON as design IP. Review the output before publishing if the source file contains private product names, customer data, unreleased UI or comments embedded in node names.
- Prefer node-specific fetches with `--node-id` when you do not need the full file.
- Rotate Figma personal access tokens regularly and revoke them immediately after suspected exposure.
- Optional OpenAI cleanup sends the rendered files to the configured OpenAI API. Keep `--cleanup off` for local-only deterministic generation.
- `npm run public-surface` checks that private workflow files, env files, common API key patterns and attribution markers are not tracked.
