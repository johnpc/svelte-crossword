import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

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
				// Includes .svelte components. Branch floor is a touch lower than the
				// rest because Svelte's compiler emits defensive branches (slot
				// fallbacks, prop defaults) that aren't all reachable from tests.
				branches: 85,
				functions: 92,
				lines: 92,
				statements: 92
			},
			// Both the .ts/.js logic layer and .svelte components are gated. Component
			// logic is unit-tested via @testing-library/svelte render tests.
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: [
				'src/app.d.ts',
				'src/service-worker.ts',
				'src/**/*.test.{js,ts}',
				'src/**/*.spec.{js,ts}',
				'src/**/*.d.ts',
				// Test-only fixtures (stub components rendered by tests).
				'src/**/__fixtures__/**',
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
