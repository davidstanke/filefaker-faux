# Project Guidelines for FileFaker Faux

## 1. Local Execution & Hot Reloading
Whenever this application is run locally, always run it with hot reloading enabled:
- Use `npm run dev` (or `vite dev`), which provides Hot Module Replacement (HMR).
- Never run with `--no-hmr` or in non-reloading static modes when running locally.
- Maintain `server.hmr: true` in `vite.config.ts`.

## 2. Integration Testing Restrictions
Integration tests in this project (`npm run test:integration` or `npx playwright test`) must **NEVER** be run automatically by AI assistants, automated scripts, CI hooks, or background tasks:
- Automated verification tools and AI agents must strictly only execute unit tests (`npm test`).
- Integration tests may only be initiated when the human developer explicitly asks for integration tests to be run (e.g., "run the integration tests", "run playwright", "test:integration").
