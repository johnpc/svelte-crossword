import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true,
		allowedHosts: ['xss-dev.tuns.sh']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		coverage: {
			provider: 'istanbul',
			reporter: ['text', 'json', 'html', 'json-summary'],
			reportsDirectory: './coverage',
			thresholds: {
				branches: 75,
				functions: 85,
				lines: 80,
				statements: 80
			},
			include: ['src/**/*.{js,ts}'],
			exclude: ['src/app.d.ts', 'src/**/*.test.{js,ts}', 'src/**/*.spec.{js,ts}']
		}
	}
});
