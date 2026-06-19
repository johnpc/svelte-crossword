import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	server: {
		host: true,
		allowedHosts: ['xss-dev.tuns.sh']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./vitest-setup.ts'],
		coverage: {
			provider: 'istanbul',
			// Instrument every included file, not just those imported by a test, so an
			// untested file can't sneak in at an implicit 100%.
			all: true,
			reporter: ['text', 'json', 'html', 'json-summary'],
			reportsDirectory: './coverage',
			thresholds: {
				branches: 90,
				functions: 92,
				lines: 92,
				statements: 92
			},
			// NOTE: .svelte components are being migrated into this gate wave by wave as
			// they gain tests (see README "Testing strategy"). Until that migration lands,
			// the threshold-enforced scope is the .ts/.js logic layer.
			include: ['src/**/*.{js,ts}'],
			exclude: [
				'src/app.d.ts',
				'src/service-worker.ts',
				'src/**/*.test.{js,ts}',
				'src/**/*.spec.{js,ts}',
				'src/**/*.d.ts',
				// Type-only and static data modules carry no executable logic.
				'src/routes/**/types.ts',
				'src/routes/helpers/types/**',
				'src/routes/components/crossword/themes/**',
				'src/routes/components/keyboard/layouts/**',
				'src/routes/components/keyboard/svg/**'
			]
		}
	}
});
