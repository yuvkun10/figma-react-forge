import js from "@eslint/js";
import tseslint from "typescript-eslint";

const nodeGlobals = {
  Buffer: "readonly",
  URL: "readonly",
  console: "readonly",
  fetch: "readonly",
  process: "readonly"
};

export default tseslint.config(
  {
    ignores: [
      ".codex/**",
      ".env",
      ".env.*",
      ".git/**",
      "AGENTS.md",
      "Obsidian/**",
      "coverage/**",
      "dist/**",
      "node_modules/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: nodeGlobals,
      sourceType: "module"
    },
    rules: {
      "no-undef": "off"
    }
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  }
);
