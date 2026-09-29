import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright integration test configuration.
 * IMPORTANT: According to .gemini/rules/testing-rules.md, integration tests
 * must NEVER be executed automatically by AI agents or background tasks.
 * They should only be executed when explicitly commanded by the developer.
 */
export default defineConfig({
	testDir: './tests/integration',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: 'http://localhost:5173',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'npm run dev -- --port 5173',
		url: 'http://localhost:5173',
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
