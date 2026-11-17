import { describe, it, expect, vi, beforeEach } from 'vitest';

const vibrate = vi.fn();
vi.mock('../helpers/haptics', () => ({ vibrate: () => vibrate() }));

import { PREVIEW_PUZZLE, previewSession, resetPreviewSession } from './previewSession';
import { previewClues } from './previewClues';

describe('previewSession', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetPreviewSession();
	});

	it('is one module-level sitting over the preview clues', () => {
		expect(PREVIEW_PUZZLE).toEqual({ id: 'preview', clues: previewClues });
		expect(previewSession.current()).toEqual({ phase: 'loading' });
	});

	it('vibrates once when the preview is solved', () => {
		previewSession.send({ type: 'puzzleLoaded', puzzle: PREVIEW_PUZZLE });
		previewSession.send({ type: 'gridSolved' });
		previewSession.send({ type: 'gridSolved' });
		expect(previewSession.current().phase).toBe('solved');
		expect(vibrate).toHaveBeenCalledOnce();
	});

	it('resetPreviewSession returns to loading', () => {
		previewSession.send({ type: 'puzzleLoaded', puzzle: PREVIEW_PUZZLE });
		resetPreviewSession();
		expect(previewSession.current()).toEqual({ phase: 'loading' });
	});
});
