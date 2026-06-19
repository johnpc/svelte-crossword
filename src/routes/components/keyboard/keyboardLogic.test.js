import { describe, it, expect } from 'vitest';
import {
	ALPHABET,
	SWAPS,
	unique,
	processKeyStart,
	transformKeyData,
	getRowData
} from './keyboardLogic.js';

describe('keyboardLogic', () => {
	describe('ALPHABET', () => {
		it('contains all 26 lowercase letters', () => {
			expect(ALPHABET).toBe('abcdefghijklmnopqrstuvwxyz');
			expect(ALPHABET.length).toBe(26);
		});
	});

	describe('SWAPS', () => {
		it('has expected keys', () => {
			expect(SWAPS.Page0).toBe('abc');
			expect(SWAPS.Page1).toBe('?123');
			expect(SWAPS.Space).toBe(' ');
			expect(SWAPS.Shift).toBe('abc');
		});
	});

	describe('unique', () => {
		it('removes duplicate values from an array', () => {
			expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
		});

		it('returns empty array for empty input', () => {
			expect(unique([])).toEqual([]);
		});

		it('preserves order of first occurrence', () => {
			expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
		});
	});

	describe('processKeyStart', () => {
		it('returns page type for Page keys', () => {
			expect(processKeyStart('Page0', false)).toEqual({ type: 'page', page: 0 });
			expect(processKeyStart('Page1', false)).toEqual({ type: 'page', page: 1 });
		});

		it('returns shift type for Shift key', () => {
			expect(processKeyStart('Shift', false)).toEqual({ type: 'shift', shifted: true });
			expect(processKeyStart('Shift', true)).toEqual({ type: 'shift', shifted: false });
		});

		it('returns key type with lowercase when not shifted', () => {
			expect(processKeyStart('a', false)).toEqual({ type: 'key', output: 'a' });
		});

		it('returns key type with uppercase when shifted and letter', () => {
			expect(processKeyStart('a', true)).toEqual({ type: 'key', output: 'A' });
		});

		it('does not uppercase non-alphabet characters when shifted', () => {
			expect(processKeyStart('Space', true)).toEqual({ type: 'key', output: 'Space' });
			expect(processKeyStart('1', true)).toEqual({ type: 'key', output: '1' });
		});
	});

	describe('transformKeyData', () => {
		const swaps = { Page0: 'abc', Shift: 'abc' };

		it('swaps display value when swap is available', () => {
			const data = [{ value: 'Page0', row: 0 }];
			const result = transformKeyData(data, swaps, [], false);
			expect(result[0].display).toBe('abc');
		});

		it('does not swap when value is in noSwap list', () => {
			const data = [{ value: 'Page0', row: 0 }];
			const result = transformKeyData(data, swaps, ['Page0'], false);
			expect(result[0].display).toBe('Page0');
		});

		it('does not swap when item has noSwap flag', () => {
			const data = [{ value: 'Page0', row: 0, noSwap: true }];
			const result = transformKeyData(data, swaps, [], false);
			expect(result[0].display).toBe('Page0');
		});

		it('uppercases display when shifted', () => {
			const data = [{ value: 'a', row: 0 }];
			const result = transformKeyData(data, swaps, [], true);
			expect(result[0].display).toBe('A');
		});

		it('shows lowercase when not shifted', () => {
			const data = [{ value: 'a', row: 0 }];
			const result = transformKeyData(data, swaps, [], false);
			expect(result[0].display).toBe('a');
		});

		it('handles Shift key display correctly', () => {
			const data = [{ value: 'Shift', row: 0 }];
			const result = transformKeyData(data, swaps, [], false);
			expect(result[0].display).toBe('ABC');
		});

		it('handles Shift key display when shifted', () => {
			const data = [{ value: 'Shift', row: 0 }];
			const result = transformKeyData(data, swaps, [], true);
			expect(result[0].display).toBe('abc');
		});

		it('preserves existing display property', () => {
			const data = [{ value: 'custom', row: 0, display: 'Custom Label' }];
			const result = transformKeyData(data, swaps, [], false);
			expect(result[0].display).toBe('Custom Label');
		});
	});

	describe('getRowData', () => {
		it('splits data into two pages', () => {
			const data = [
				{ value: 'a', row: 0, display: 'a' },
				{ value: 'b', row: 0, display: 'b' },
				{ value: '1', row: 0, page: 1, display: '1' }
			];
			const result = getRowData(data);
			expect(result.length).toBe(2);
			expect(result[0][0].length).toBe(2);
			expect(result[1][0].length).toBe(1);
		});

		it('groups keys by row within each page', () => {
			const data = [
				{ value: 'a', row: 0, display: 'a' },
				{ value: 'b', row: 1, display: 'b' },
				{ value: 'c', row: 0, display: 'c' }
			];
			const result = getRowData(data);
			expect(result[0].length).toBe(2);
			expect(result[0][0]).toEqual([
				{ value: 'a', row: 0, display: 'a' },
				{ value: 'c', row: 0, display: 'c' }
			]);
			expect(result[0][1]).toEqual([{ value: 'b', row: 1, display: 'b' }]);
		});

		it('sorts rows numerically', () => {
			const data = [
				{ value: 'b', row: 2, display: 'b' },
				{ value: 'a', row: 0, display: 'a' },
				{ value: 'c', row: 1, display: 'c' }
			];
			const result = getRowData(data);
			expect(result[0][0][0].row).toBe(0);
			expect(result[0][1][0].row).toBe(1);
			expect(result[0][2][0].row).toBe(2);
		});
	});
});
