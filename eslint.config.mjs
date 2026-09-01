import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Per-developer agent tooling (gitignored). CommonJS hook scripts run by
    // Claude Code / Cursor, not app source — linting them only reports
    // no-require-imports against files that must use require().
    ".claude/**",
    ".cursor/**",
  ]),
]);

export default eslintConfig;
