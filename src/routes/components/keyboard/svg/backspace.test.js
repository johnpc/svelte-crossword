import { describe, it, expect } from 'vitest';
import backspace from './backspace.js';

describe('backspace SVG', () => {
	it('exports an SVG string', () => {
		expect(typeof backspace).toBe('string');
		expect(backspace).toContain('<svg');
		expect(backspace).toContain('</svg>');
	});

	it('contains the delete icon path', () => {
		expect(backspace).toContain('feather-delete');
	});
});
