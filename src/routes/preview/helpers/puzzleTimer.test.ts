import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPuzzleTimer, findCellsInRef, resolveTimerStep } from './puzzleTimer';

describe('createPuzzleTimer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('calls onTick every second when puzzle is not complete', () => {
		const onTick = vi.fn();
		createPuzzleTimer({
			getRef: () => null,
			isPuzzleComplete: () => false,
			onComplete: vi.fn(),
			onTick
		});

		vi.advanceTimersByTime(3000);
		expect(onTick).toHaveBeenCalledTimes(3);
	});

	it('stops ticking when isPuzzleComplete returns true', () => {
		const onTick = vi.fn();
		let complete = false;
		createPuzzleTimer({
			getRef: () => null,
			isPuzzleComplete: () => complete,
			onComplete: vi.fn(),
			onTick
		});

		vi.advanceTimersByTime(2000);
		complete = true;
		vi.advanceTimersByTime(3000);
		// Should have ticked twice before stopping, then no more
		expect(onTick.mock.calls.length).toBeLessThanOrEqual(3);
	});

	it('calls onComplete when all cells match', () => {
		const onComplete = vi.fn();
		const mockRef = {
			$$: {
				ctx: [
					[
						{ answer: 'A', value: 'A' },
						{ answer: 'B', value: 'B' }
					]
				]
			}
		};
		createPuzzleTimer({
			getRef: () => mockRef,
			isPuzzleComplete: () => false,
			onComplete,
			onTick: vi.fn()
		});

		vi.advanceTimersByTime(1000);
		expect(onComplete).toHaveBeenCalledOnce();
	});

	it('does not call onComplete when cells do not match', () => {
		const onComplete = vi.fn();
		const onTick = vi.fn();
		const mockRef = {
			$$: {
				ctx: [
					[
						{ answer: 'A', value: 'X' },
						{ answer: 'B', value: 'B' }
					]
				]
			}
		};
		createPuzzleTimer({
			getRef: () => mockRef,
			isPuzzleComplete: () => false,
			onComplete,
			onTick
		});

		vi.advanceTimersByTime(1000);
		expect(onComplete).not.toHaveBeenCalled();
		expect(onTick).toHaveBeenCalled();
	});

	it('keeps waiting (no tick) while the ref has no cells yet', () => {
		const onTick = vi.fn();
		createPuzzleTimer({
			getRef: () => ({ $$: { ctx: ['not-cells', 42] } }),
			isPuzzleComplete: () => false,
			onComplete: vi.fn(),
			onTick
		});
		vi.advanceTimersByTime(3000);
		expect(onTick).not.toHaveBeenCalled();
	});

	it('stops ticking after the returned cancel function is called', () => {
		const onTick = vi.fn();
		const cancel = createPuzzleTimer({
			getRef: () => null,
			isPuzzleComplete: () => false,
			onComplete: vi.fn(),
			onTick
		});
		vi.advanceTimersByTime(2000);
		cancel();
		vi.advanceTimersByTime(3000);
		expect(onTick).toHaveBeenCalledTimes(2);
	});
});

describe('findCellsInRef', () => {
	it('returns undefined for null refs and refs without ctx', () => {
		expect(findCellsInRef(null)).toBeUndefined();
		expect(findCellsInRef({})).toBeUndefined();
	});

	it('finds the cells array inside the component ctx', () => {
		const cells = [{ answer: 'A', value: '' }];
		expect(findCellsInRef({ $$: { ctx: [1, 'x', cells] } })).toBe(cells);
	});

	it('ignores arrays whose first element is not a cell', () => {
		expect(findCellsInRef({ $$: { ctx: [[{ foo: 1 }]] } })).toBeUndefined();
	});
});

describe('resolveTimerStep', () => {
	it('ticks when there is no ref', () => {
		expect(resolveTimerStep(null, false)).toBe('tick');
	});

	it('ticks when the puzzle is already complete', () => {
		expect(resolveTimerStep({ $$: { ctx: [] } }, true)).toBe('tick');
	});

	it('skips when the ref has no cells yet', () => {
		expect(resolveTimerStep({ $$: { ctx: [] } }, false)).toBe('skip');
	});

	it('completes when all cells match their answers', () => {
		const ref = { $$: { ctx: [[{ answer: 'A', value: 'A' }]] } };
		expect(resolveTimerStep(ref, false)).toBe('complete');
	});

	it('ticks when some cells do not match', () => {
		const ref = { $$: { ctx: [[{ answer: 'A', value: 'B' }]] } };
		expect(resolveTimerStep(ref, false)).toBe('tick');
	});
});
