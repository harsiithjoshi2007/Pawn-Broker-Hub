---
name: deployment typecheck vs local build
description: why a deploy build can fail on TypeScript errors that local `pnpm run build` in an artifact never surfaces
---

# Deployment runs a full typecheck; artifact-local build does not

The deployment/CI build runs the **root** `pnpm run typecheck` which does `tsc --build` on the composite lib packages FIRST, then `tsc -p tsconfig.json --noEmit` per artifact. The api-server's own `build` script is just esbuild (`node ./build.mjs`) with **no typecheck**, so `pnpm --filter @workspace/api-server run build` passes locally even when types are broken.

**Why:** A grayed-out / failing deploy with a healthy local build almost always means a *typecheck* failure, not a runtime/bundling failure. Reproduce it with the ROOT `pnpm run typecheck`, never the artifact build alone.

**How to apply:**
- Before declaring a deploy-readiness fix done, run `pnpm run typecheck` at repo root.
- If you see "Module '@workspace/db' has no exported member X" or "Property Y does not exist" for things that clearly exist in the schema source, the lib declaration output is STALE. Fix by running `tsc --build` (root `typecheck:libs`) which regenerates composite `.d.ts`. Do not "fix" the source — it isn't wrong.
- Vite `vite.config.ts` that throws on missing `PORT`/`BASE_PATH` at config-load time breaks `vite build` (build has no PORT). Guard those checks with `const isBuild = process.env.NODE_ENV === "production" || process.argv.includes("build")` and only enforce when `!isBuild`.

# pino-http ESM/CJS default-import trap

With `moduleResolution: "bundler"` and no `esModuleInterop`, `import pinoHttp from "pino-http"` typechecks as a non-callable namespace (TS2349), which cascades into TS7006 implicit-any on its serializer params. Use the named export instead: `import { pinoHttp } from "pino-http"`.
