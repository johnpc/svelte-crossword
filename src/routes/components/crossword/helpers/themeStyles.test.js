import { describe, it, expect } from 'vitest';
import themes from './themeStyles.js';

describe('themeStyles', () => {
	it('exports all expected themes', () => {
		expect(themes).toHaveProperty('classic');
		expect(themes).toHaveProperty('dark');
		expect(themes).toHaveProperty('citrus');
		expect(themes).toHaveProperty('amelia');
		expect(themes).toHaveProperty('pink');
	});

	it('classic theme is a CSS variable string', () => {
		expect(typeof themes.classic).toBe('string');
		expect(themes.classic).toContain('--primary-highlight-color');
		expect(themes.classic).toContain('--bg-color');
	});

	it('each theme contains CSS custom properties', () => {
		Object.values(themes).forEach((theme) => {
			expect(theme).toContain('--font');
			expect(theme).toContain('--main-color');
			expect(theme).toContain('var(--xd-');
		});
	});

	it('themes use fallback pattern with var(--xd-*)', () => {
		expect(themes.dark).toMatch(/var\(--xd-[\w-]+,\s*[^)]+\)/);
	});
});
