import { describe, it, expect } from 'vitest';
import layout from './crossword.js';

describe('qwerty crossword keyboard layout', () => {
	it('exports an array of keys', () => {
		expect(Array.isArray(layout)).toBe(true);
		expect(layout.length).toBeGreaterThan(0);
	});

	it('each key has a row and value', () => {
		layout.forEach((key) => {
			expect(key).toHaveProperty('row');
			expect(key).toHaveProperty('value');
			expect(typeof key.row).toBe('number');
			expect(typeof key.value).toBe('string');
		});
	});

	it('page 0 contains all 26 letters plus Backspace', () => {
		const page0 = layout.filter((k) => !k.page);
		const values = page0.map((k) => k.value);
		for (let i = 65; i <= 90; i++) {
			expect(values).toContain(String.fromCharCode(i));
		}
		expect(values).toContain('Backspace');
	});

	it('page 0 includes a Page1 toggle key', () => {
		const values = layout.filter((k) => !k.page).map((k) => k.value);
		expect(values).toContain('Page1');
	});

	it('page 1 contains digits 0-9 and a Page0 toggle', () => {
		const page1 = layout.filter((k) => k.page === 1);
		const values = page1.map((k) => k.value);
		for (const d of '0123456789') {
			expect(values).toContain(d);
		}
		expect(values).toContain('Page0');
	});

	it('page 1 contains common symbols', () => {
		const values = layout.filter((k) => k.page === 1).map((k) => k.value);
		for (const s of ['!', '@', '#', '$', '%']) {
			expect(values).toContain(s);
		}
	});
});
