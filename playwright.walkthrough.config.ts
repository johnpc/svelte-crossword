/**
 * UX walkthrough: not part of the acceptance suite. Drives the real app
 * against the fake backend, records a video + screenshots of every flow and
 * writes load/interaction timings. Run on the Mac mini:
 *   npx playwright test --config playwright.walkthrough.config.ts
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e/walkthrough',
	outputDir: 'artifacts/walkthrough/test-output',
	retries: 0,
	workers: 1,
	reporter: [['list']],
	timeout: 120_000,
	use: {
		baseURL: 'http://localhost:4173',
		serviceWorkers: 'block',
		viewport: { width: 1280, height: 900 },
		video: { mode: 'on', size: { width: 1280, height: 900 } },
		trace: 'off'
	},
	webServer: {
		command: 'npm run preview',
		port: 4173,
		reuseExistingServer: true
	}
});
