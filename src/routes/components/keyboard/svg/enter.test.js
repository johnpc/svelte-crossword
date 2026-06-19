import { describe, it, expect } from 'vitest';
import enter from './enter.js';

describe('enter SVG', () => {
	it('exports an SVG string', () => {
		expect(typeof enter).toBe('string');
		expect(enter).toContain('<svg');
		expect(enter).toContain('</svg>');
	});

	it('contains the corner-down-left icon', () => {
		expect(enter).toContain('feather-corner-down-left');
	});
});
