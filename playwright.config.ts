import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const hasCreds = !!(process.env.TEST_USERNAME && process.env.TEST_PASSWORD);

const testDir = defineBddConfig({
	features: 'e2e/features/**/*.feature',
	steps: 'e2e/steps/**/*.ts'
});

export default defineConfig({
	testDir,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: 'html',
	grepInvert: hasCreds ? undefined : /@requires-credentials/,
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
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
