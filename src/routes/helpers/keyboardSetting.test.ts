import { describe, it, expect, beforeEach } from 'vitest';
import { readKeyboardSetting, toggleKeyboardSetting } from './keyboardSetting';

describe('keyboardSetting', () => {
	beforeEach(() => localStorage.clear());

	it('defaults to showing the keyboard', () => {
		expect(readKeyboardSetting()).toBe(true);
	});

	it('toggles and persists the value', () => {
		expect(toggleKeyboardSetting(true)).toBe(false);
		expect(localStorage.getItem('showAppKeyboard')).toBe('false');
		expect(readKeyboardSetting()).toBe(false);
		expect(toggleKeyboardSetting(false)).toBe(true);
		expect(readKeyboardSetting()).toBe(true);
	});
});
