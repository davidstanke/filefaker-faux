# Local Execution Rules

## Hot Reloading Requirement

Whenever this application ("FileFaker Faux") is run locally, it must **ALWAYS** be run with hot reloading (Hot Module Replacement / HMR) enabled.

### Policy & Execution Guidelines:
1. Always launch the local server using `npm run dev` (or `vite dev`), which serves the application with active hot module reloading.
2. Never disable hot reloading (e.g., do not pass `--no-hmr` or serve static preview/production builds for local dev work where hot reloading would be lost).
3. Ensure `server.hmr: true` remains configured in `vite.config.ts`.
4. When any agent, developer, or automated task starts the application locally, it must be the hot-reloading dev server so that code modifications are instantly reflected live.
