import { toast } from '@zerodevx/svelte-toast';

/** Shown when a signed-out visitor presses Continue on the solved preview. */
export const showPreviewToast = (): void => {
	toast.push(
		'Sign in/up to unlock unlimited crosswords! No limits, no ads, just fun puzzles to solve.'
	);
};
