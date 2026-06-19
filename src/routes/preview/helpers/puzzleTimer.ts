type TimerCallbacks = {
	getRef: () => unknown;
	isPuzzleComplete: () => boolean;
	onComplete: () => void;
	onTick: () => void;
};

export const createPuzzleTimer = (callbacks: TimerCallbacks): void => {
	const tick = () => {
		setTimeout(() => {
			const ref = callbacks.getRef();
			if (ref && !callbacks.isPuzzleComplete()) {
				const cells = (ref as { $$?: { ctx?: unknown[] } })?.$$?.ctx?.find(
					(element: unknown) =>
						Array.isArray(element) &&
						(element as Array<{ answer?: string; value?: string }>)?.[0]?.answer &&
						(element as Array<{ answer?: string; value?: string }>)?.[0]?.value !== undefined
				);
				if (!cells) {
					return tick();
				}
				const allComplete = (cells as Array<{ answer: string; value: string }>).every(
					(cell) => cell.answer === cell.value
				);
				if (allComplete) {
					return callbacks.onComplete();
				}
			}
			callbacks.onTick();
			if (!callbacks.isPuzzleComplete()) {
				tick();
			}
		}, 1000);
	};
	tick();
};
