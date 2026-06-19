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

	it('contains all 26 letters plus Backspace', () => {
		const values = layout.map((k) => k.value);
		for (let i = 65; i <= 90; i++) {
			expect(values).toContain(String.fromCharCode(i));
		}
		expect(values).toContain('Backspace');
	});

	it('has 3 rows (0, 1, 2)', () => {
		const rows = new Set(layout.map((k) => k.row));
		expect(rows).toEqual(new Set([0, 1, 2]));
	});
});
