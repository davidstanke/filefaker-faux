# Testing Rules

## Integration Testing Restriction

Integration tests in this project (`npm run test:integration` or `npx playwright test`) must **NEVER** be run automatically by AI assistants, automated scripts, CI hooks, or background tasks.

### Policy:
1. Automated verification tools and AI agents must strictly only execute unit tests (`npm test`).
2. Integration tests require real browser or heavy environment execution and may mutate live mock data or test states.
3. Integration tests may only be initiated when the human developer explicitly asks for integration tests to be run (e.g., "run the integration tests", "run playwright", "test:integration").
