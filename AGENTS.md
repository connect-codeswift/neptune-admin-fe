<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# neptune-admin-fe

Admin FE. Details in `.cursor/rules/*.mdc`.

Next 16 `src/`, React 19, TW v4, RQ, axios, Iconify. `@/*`→`./src/*`.
Dirs: `inputs/` forms · `ui/` chrome · `layouts/` shells · `utils/` `lib/` `providers/` `types/` · `dtos/req|res` · `public/sidebar/` assets.
Scripts: `dev` / `build` / `lint`. No tests.
Figma→code: reuse tokens/components; logos→`public/`; else Iconify.
API DTOs: `*Payload` in `src/dtos/req/`, `*Response` in `src/dtos/res/` (see `.cursor/rules/api-dtos.mdc`).
