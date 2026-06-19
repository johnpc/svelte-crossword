import { describe, it, expect } from 'vitest';
import { getKeydownAction, popTransition } from './cellLogic.js';

const makeEvent = (overrides = {}) => ({
	key: '',
	ctrlKey: false,
	altKey: false,
	shiftKey: false,
	...overrides
});

describe('getKeydownAction', () => {
	it('returns historicalChange with diff -1 for Ctrl+Z', () => {
		const result = getKeydownAction(makeEvent({ key: 'z', ctrlKey: true }));
		expect(result).toEqual({ type: 'historicalChange', diff: -1 });
	});

	it('returns historicalChange with diff 1 for Ctrl+Shift+Z', () => {
		const result = getKeydownAction(makeEvent({ key: 'z', ctrlKey: true, shiftKey: true }));
		expect(result).toEqual({ type: 'historicalChange', diff: 1 });
	});

	it('returns null for other ctrl key combos', () => {
		expect(getKeydownAction(makeEvent({ key: 'a', ctrlKey: true }))).toBeNull();
	});

	it('returns null for alt key combos', () => {
		expect(getKeydownAction(makeEvent({ key: 'a', altKey: true }))).toBeNull();
	});

	it('returns focusClueDiff with diff 1 for Tab', () => {
		const result = getKeydownAction(makeEvent({ key: 'Tab' }));
		expect(result).toEqual({ type: 'focusClueDiff', diff: 1, preventDefault: true });
	});

	it('returns focusClueDiff with diff -1 for Shift+Tab', () => {
		const result = getKeydownAction(makeEvent({ key: 'Tab', shiftKey: true }));
		expect(result).toEqual({ type: 'focusClueDiff', diff: -1, preventDefault: true });
	});

	it('returns flipDirection for Space', () => {
		const result = getKeydownAction(makeEvent({ key: ' ' }));
		expect(result).toEqual({ type: 'flipDirection', preventDefault: true });
	});

	it('returns delete for Delete key', () => {
		expect(getKeydownAction(makeEvent({ key: 'Delete' }))).toEqual({ type: 'delete' });
	});

	it('returns delete for Backspace key', () => {
		expect(getKeydownAction(makeEvent({ key: 'Backspace' }))).toEqual({ type: 'delete' });
	});

	it('returns letter action for alphabetic keys', () => {
		expect(getKeydownAction(makeEvent({ key: 'a' }))).toEqual({ type: 'letter', value: 'A' });
		expect(getKeydownAction(makeEvent({ key: 'Z' }))).toEqual({ type: 'letter', value: 'Z' });
	});

	it('returns letter action for parentheses', () => {
		expect(getKeydownAction(makeEvent({ key: '(' }))).toEqual({ type: 'letter', value: '(' });
		expect(getKeydownAction(makeEvent({ key: ')' }))).toEqual({ type: 'letter', value: ')' });
	});

	it('returns moveFocus for arrow keys', () => {
		expect(getKeydownAction(makeEvent({ key: 'ArrowLeft' }))).toEqual({
			type: 'moveFocus',
			direction: 'across',
			diff: -1,
			preventDefault: true
		});
		expect(getKeydownAction(makeEvent({ key: 'ArrowRight' }))).toEqual({
			type: 'moveFocus',
			direction: 'across',
			diff: 1,
			preventDefault: true
		});
		expect(getKeydownAction(makeEvent({ key: 'ArrowUp' }))).toEqual({
			type: 'moveFocus',
			direction: 'down',
			diff: -1,
			preventDefault: true
		});
		expect(getKeydownAction(makeEvent({ key: 'ArrowDown' }))).toEqual({
			type: 'moveFocus',
			direction: 'down',
			diff: 1,
			preventDefault: true
		});
	});

	it('returns null for unhandled keys', () => {
		expect(getKeydownAction(makeEvent({ key: 'Enter' }))).toBeNull();
		expect(getKeydownAction(makeEvent({ key: '1' }))).toBeNull();
		expect(getKeydownAction(makeEvent({ key: 'F5' }))).toBeNull();
	});
});

describe('popTransition', () => {
	it('returns an object with delay, duration, and css function', () => {
		const result = popTransition(null, { delay: 100, duration: 500 });
		expect(result.delay).toBe(100);
		expect(result.duration).toBe(500);
		expect(typeof result.css).toBe('function');
	});

	it('uses default delay and duration when not provided', () => {
		const result = popTransition(null, {});
		expect(result.delay).toBe(0);
		expect(result.duration).toBe(250);
	});

	it('css returns correct transform at t=0 and t=1', () => {
		const result = popTransition(null, {});
		expect(result.css(0)).toBe('transform: translate(0, 1px)');
		expect(result.css(1)).toBe('transform: translate(0, 0px)');
	});
});
