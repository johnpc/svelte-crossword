import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
	features: 'e2e/features/**/*.feature',
	steps: ['e2e/fixtures.ts', 'e2e/steps/**/*.ts']
});

export default defineConfig({
	testDir,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	// No retries anywhere: an intermittent failure is a race to find and fix in
	// the harness (see AGENTS.md), never something to paper over by re-running.
	retries: 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'retain-on-failure',
		// The app registers a service worker; blocking it keeps every request
		// routable by the fake backend and every run free of stale caches.
		serviceWorkers: 'block',
		launchOptions: {
			slowMo: process.env.SLOW_MO ? Number(process.env.SLOW_MO) : 0
		}
	},
	webServer: {
		command: 'npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
