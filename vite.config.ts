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
				branches: 15,
				functions: 15,
				lines: 15,
				statements: 15
			},
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: ['src/app.d.ts', 'src/**/*.test.{js,ts}', 'src/**/*.spec.{js,ts}']
		}
	}
});
