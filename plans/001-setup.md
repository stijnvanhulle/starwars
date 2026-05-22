# 001: Setup

## Context

Transform the library-style template into a Next.js 16.2.6 app at `apps/platform` with `MUI v9` wired and a `packages/components` placeholder. No business code, no DB, no API, no Kubb, no Redux, those land in their own slices.

## Goal (demoable outcome)

`pnpm dev` serves an `MUI`-themed `Next.js` page at `http://localhost:3000` that renders the project name and a sample `MUI` `Button` to prove the theme provider is wired. `pnpm typecheck`, `pnpm lint`, and `pnpm test` all pass. `packages/core` and `packages/demo` are gone. The workspace now includes `apps/platform` and `packages/components`.

## Prerequisites

None. This is the first execution slice.

## Steps

1. **Add `apps/*` to the workspace.** Edit [`pnpm-workspace.yaml`](pnpm-workspace.yaml) so `packages:` includes `apps/*`. Mirror the same glob into the root `package.json` `workspaces.packages` array.
2. **Delete `packages/core` and `packages/demo`.** Remove both directories. Drop any `references` entries to them from `tsconfig.json` and any cspell allow-list entries that only existed because of those packages.
3. **Scaffold `apps/platform`** with `package.json` (`name: "@stijnvanhulle/platform"`, `private: true`, `type: "module"`), `tsconfig.json` extending `configs/base.json`, and Next.js's standard layout. Use the App Router. Pin `next@16.2.6`; let `react` / `react-dom` resolve to whatever Next.js 16.2.6 ships with. Add the `dev`, `build`, `start`, `lint`, `typecheck` scripts.
4. **Install `MUI v9` (`9.0.1`) and the App Router cache provider** in `apps/platform`: `@mui/material@9.0.1`, `@mui/material-nextjs@9.0.1`, `@emotion/react`, `@emotion/cache`, `@emotion/styled`. Create `apps/platform/src/theme/theme.ts` with a placeholder `createTheme(...)` call (real tokens land in Slice 003).
5. **Wire the providers** in `apps/platform/src/app/layout.tsx`. Wrap children in `<AppRouterCacheProvider>` then `<ThemeProvider theme={lightTheme}>` and `<CssBaseline />`. Body uses the theme's font stack.
6. **Build the placeholder home page** at `apps/platform/src/app/page.tsx`. One `Container`, one `Typography variant="h3"` with the app name ("Whale Star Wars Team Builder"), one `Button variant="contained"` that does nothing. Enough surface to confirm the theme is alive.
7. **Scaffold `packages/components`** with `package.json` (`name: "@stijnvanhulle/components"`, `type: "module"`, `exports` field pointing at `dist/index.js`), `tsconfig.json`, `tsdown.config.ts`, and `src/index.ts` exporting a single placeholder named export (e.g. `export const PLACEHOLDER = "components";`). Real components arrive in Slice 003. Add it as a dependency in `apps/platform/package.json` (`"workspace:*"`).
8. **Allow remote images from `akabab`.** In `apps/platform/next.config.ts`, add `images.remotePatterns` for `https://akabab.github.io/starwars-api/api/**`.
9. **Update root scripts.** Adjust the root `package.json`:
   - `dev`: `turbo run dev --filter=@stijnvanhulle/platform`
   - `build`: extend the existing filter to include `apps/*`
   - `lint`: also lint `./apps`
   - `format`: also format `apps`
   Add `dev` to `turbo.json` `tasks` as a persistent, uncached task with `inputs` covering `apps/*` source.
10. **Verify the green tree.** Run `pnpm install`, then in parallel: `pnpm typecheck`, `pnpm lint`, `pnpm test`. Fix anything that surfaces, mostly imports referencing the deleted packages.

## Files touched

- `pnpm-workspace.yaml`: modified (add `apps/*` to `packages:`)
- `package.json`: modified (workspaces glob, scripts)
- `turbo.json`: modified (add persistent `dev` task)
- `tsconfig.json`: modified (drop references to deleted packages, add `apps/platform`)
- `packages/core/`: deleted
- `packages/demo/`: deleted
- `packages/components/package.json`: created
- `packages/components/tsconfig.json`: created
- `packages/components/tsdown.config.ts`: created
- `packages/components/src/index.ts`: created
- `apps/platform/package.json`: created
- `apps/platform/tsconfig.json`: created
- `apps/platform/next.config.ts`: created
- `apps/platform/next-env.d.ts`: created
- `apps/platform/src/app/layout.tsx`: created
- `apps/platform/src/app/page.tsx`: created
- `apps/platform/src/theme/theme.ts`: created
- `cspell.json`: modified (only if it referenced the deleted packages)

## Verification

1. `pnpm install` completes without errors and resolves `@stijnvanhulle/components` as a workspace link in `apps/platform/node_modules`.
2. `pnpm typecheck` exits 0.
3. `pnpm lint` exits 0.
4. `pnpm test` exits 0 (no tests yet is acceptable; the command must still succeed).
5. `pnpm dev` starts. Visiting `http://localhost:3000` shows the app name and the styled `MUI` `Button`. Devtools shows the `Inter` (or whatever the theme picks) font applied to `body`, confirming the theme provider is wired.
6. `ls packages/` shows only `components/`. `packages/core` and `packages/demo` are gone.

## Done criteria

- [ ] `pnpm-workspace.yaml` and root `package.json` include `apps/*`
- [ ] `packages/core` and `packages/demo` deleted; no dangling references in configs or scripts
- [ ] `apps/platform` boots via `pnpm dev` and renders an `MUI`-themed page at `/`
- [ ] `AppRouterCacheProvider` + `ThemeProvider` + `CssBaseline` wrap the app in `layout.tsx`
- [ ] `next.config.ts` allows `akabab` image URLs
- [ ] `packages/components` exists with a placeholder export and is linked from `apps/platform`
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` all green
- [ ] No code in this slice imports `Drizzle`, `Redux`, `Kubb`, or anything outside Next + MUI (those belong to later slices)
