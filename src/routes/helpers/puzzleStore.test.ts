import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import { puzzleStore, resetPuzzleStoreDefaults } from './puzzleStore';

describe('puzzleStore', () => {
	it('has correct default values', () => {
		const value = get(puzzleStore);
		expect(value).toEqual({ completedPreview: false });
	});

	it('can be updated', () => {
		puzzleStore.set({ completedPreview: true });
		expect(get(puzzleStore)).toEqual({ completedPreview: true });
	});

	it('resets to defaults', () => {
		puzzleStore.set({ completedPreview: true });
		resetPuzzleStoreDefaults();
		expect(get(puzzleStore)).toEqual({ completedPreview: false });
	});
});
