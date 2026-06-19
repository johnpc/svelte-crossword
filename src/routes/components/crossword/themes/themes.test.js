import { describe, it, expect } from 'vitest';
import classic from './classic.js';
import dark from './dark.js';
import citrus from './citrus.js';
import amelia from './amelia.js';
import pink from './pink.js';

describe('theme definitions', () => {
	const themes = { classic, dark, citrus, amelia, pink };

	it('each theme is an object', () => {
		Object.values(themes).forEach((theme) => {
			expect(typeof theme).toBe('object');
			expect(theme).not.toBeNull();
		});
	});

	it('each theme has primary-highlight-color', () => {
		Object.values(themes).forEach((theme) => {
			expect(theme).toHaveProperty('primary-highlight-color');
		});
	});

	it('each theme has secondary-highlight-color', () => {
		Object.values(themes).forEach((theme) => {
			expect(theme).toHaveProperty('secondary-highlight-color');
		});
	});

	it('each theme has main-color', () => {
		Object.values(themes).forEach((theme) => {
			expect(theme).toHaveProperty('main-color');
		});
	});

	it('classic theme has all expected properties', () => {
		expect(classic).toHaveProperty('font');
		expect(classic).toHaveProperty('bg-color');
		expect(classic).toHaveProperty('accent-color');
		expect(classic).toHaveProperty('scrollbar-color');
		expect(classic).toHaveProperty('order');
	});

	it('dark theme has dark bg-color', () => {
		expect(dark['bg-color']).toBe('#1a1a1a');
	});
});
