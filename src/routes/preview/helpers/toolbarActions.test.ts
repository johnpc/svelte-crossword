import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	onToolbarClear,
	onToolbarReveal,
	onToolbarCheck,
	toggleKeyboardSetting
} from './toolbarActions';

vi.mock('../../helpers/haptics', () => ({
	haptic: vi.fn()
}));

describe('toolbarActions', () => {
	describe('onToolbarClear', () => {
		it('calls the onClear callback', () => {
			const onClear = vi.fn();
			onToolbarClear(onClear);
			expect(onClear).toHaveBeenCalledOnce();
		});

		it('returns action clear', () => {
			const result = onToolbarClear(vi.fn());
			expect(result.action).toBe('clear');
		});
	});

	describe('onToolbarReveal', () => {
		it('calls the onReveal callback', () => {
			const onReveal = vi.fn();
			onToolbarReveal(onReveal);
			expect(onReveal).toHaveBeenCalledOnce();
		});

		it('returns action reveal', () => {
			const result = onToolbarReveal(vi.fn());
			expect(result.action).toBe('reveal');
		});
	});

	describe('onToolbarCheck', () => {
		it('calls the onCheck callback', () => {
			const onCheck = vi.fn();
			onToolbarCheck(onCheck);
			expect(onCheck).toHaveBeenCalledOnce();
		});

		it('returns action check', () => {
			const result = onToolbarCheck(vi.fn());
			expect(result.action).toBe('check');
		});
	});

	describe('toggleKeyboardSetting', () => {
		beforeEach(() => {
			localStorage.clear();
		});

		it('returns false when current is true', () => {
			expect(toggleKeyboardSetting(true)).toBe(false);
		});

		it('returns true when current is false', () => {
			expect(toggleKeyboardSetting(false)).toBe(true);
		});

		it('persists the value to localStorage', () => {
			toggleKeyboardSetting(true);
			expect(localStorage.getItem('showAppKeyboard')).toBe('false');
		});
	});
});
