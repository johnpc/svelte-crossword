type TimerCallbacks = {
	getRef: () => unknown;
	isPuzzleComplete: () => boolean;
	onComplete: () => void;
	onTick: () => void;
};

type CellLike = { answer?: string; value?: string };

/** Digs the cells array out of the crossword component's internal context. */
export const findCellsInRef = (ref: unknown): CellLike[] | undefined => {
	const ctx = (ref as { $$?: { ctx?: unknown[] } })?.$$?.ctx;
	return ctx?.find(
		(element: unknown) =>
			Array.isArray(element) &&
			(element as CellLike[])[0]?.answer &&
			(element as CellLike[])[0]?.value !== undefined
	) as CellLike[] | undefined;
};

/** One timer step: 'complete' | 'tick' | 'skip' (cells not mounted yet). */
export const resolveTimerStep = (
	ref: unknown,
	isPuzzleComplete: boolean
): 'complete' | 'tick' | 'skip' => {
	if (!ref || isPuzzleComplete) return 'tick';
	const cells = findCellsInRef(ref);
	if (!cells) return 'skip';
	const allComplete = cells.every((cell) => cell.answer === cell.value);
	return allComplete ? 'complete' : 'tick';
};

/** Starts the preview timer loop. Returns a cancel function for unmount. */
export const createPuzzleTimer = (callbacks: TimerCallbacks): (() => void) => {
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let cancelled = false;
	const tick = () => {
		timeout = setTimeout(() => {
			if (cancelled) return;
			const step = resolveTimerStep(callbacks.getRef(), callbacks.isPuzzleComplete());
			if (step === 'complete') return callbacks.onComplete();
			if (step === 'skip') return tick();
			callbacks.onTick();
			if (!callbacks.isPuzzleComplete()) tick();
		}, 1000);
	};
	tick();
	return () => {
		cancelled = true;
		clearTimeout(timeout);
	};
};
