import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredTheme, applyTheme, cycleTheme, getThemeIcon } from './themeManager';

describe('themeManager', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
	});

	describe('getStoredTheme', () => {
		it('returns system when nothing stored', () => {
			expect(getStoredTheme()).toBe('system');
		});

		it('returns light when light is stored', () => {
			localStorage.setItem('theme', 'light');
			expect(getStoredTheme()).toBe('light');
		});

		it('returns dark when dark is stored', () => {
			localStorage.setItem('theme', 'dark');
			expect(getStoredTheme()).toBe('dark');
		});

		it('returns system for invalid stored value', () => {
			localStorage.setItem('theme', 'invalid');
			expect(getStoredTheme()).toBe('system');
		});
	});

	describe('applyTheme', () => {
		it('removes data-theme attribute for system', () => {
			document.documentElement.setAttribute('data-theme', 'dark');
			applyTheme('system');
			expect(document.documentElement.getAttribute('data-theme')).toBeNull();
		});

		it('sets data-theme to light', () => {
			applyTheme('light');
			expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		});

		it('sets data-theme to dark', () => {
			applyTheme('dark');
			expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		});

		it('persists theme to localStorage', () => {
			applyTheme('dark');
			expect(localStorage.getItem('theme')).toBe('dark');
		});
	});

	describe('cycleTheme', () => {
		it('cycles light to dark', () => {
			expect(cycleTheme('light')).toBe('dark');
		});

		it('cycles dark to system', () => {
			expect(cycleTheme('dark')).toBe('system');
		});

		it('cycles system to light', () => {
			expect(cycleTheme('system')).toBe('light');
		});
	});

	describe('getThemeIcon', () => {
		it('returns sun for light', () => {
			expect(getThemeIcon('light')).toBe('☀️');
		});

		it('returns moon for dark', () => {
			expect(getThemeIcon('dark')).toBe('🌙');
		});

		it('returns computer for system', () => {
			expect(getThemeIcon('system')).toBe('💻');
		});
	});
});
