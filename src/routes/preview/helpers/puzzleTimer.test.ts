import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPuzzleTimer } from './puzzleTimer';

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
});
