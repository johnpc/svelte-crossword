import { writable } from 'svelte/store';

export const puzzleStore = writable({
	completedPreview: false
});

export const resetPuzzleStoreDefaults = () => {
	puzzleStore.set({
		completedPreview: false
	});
};
