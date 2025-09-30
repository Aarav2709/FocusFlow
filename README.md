# YPT-PC

Yeolpumta, but for PC!

## Development

This repository is set up as a TypeScript project-reference monorepo with three projects:

- `shared` — shared types and IPC channel constants
- `main` — Electron main process
- `renderer` — Vite + React renderer

Quick commands:

```pwsh
# install deps
npm install

# build TypeScript projects (shared -> main -> renderer)
npm run build:ts

# watch TypeScript in project-reference watch mode
npm run watch:ts

# start full dev (renderer + tsc watch + electron)
npm run dev
```

Notes:

- The Electron main process uses `tsconfig-paths` at runtime so imports that use the `@shared/*` alias resolve to compiled outputs in `dist/shared`.
- If you run into native build issues for `better-sqlite3`, ensure you have the required build tools on Windows (Visual Studio Build Tools) or use the prebuilt binaries appropriate for your Node version.

## Build / Package

```pwsh
# full production build
npm run build

# package the app (electron-builder)
npm run package
```
