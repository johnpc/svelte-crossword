import { toast } from '@zerodevx/svelte-toast';

export const toastOptions = {
	theme: {
		'--toastBackground': 'palevioletred',
		'--toastColor': 'white',
		'--toastBarBackground': 'mediumVioletRed'
	}
};

export const showPreviewToast = (): void => {
	toast.push(
		'Sign in/up to unlock unlimited crosswords! No limits, no ads, just fun puzzles to solve.'
	);
};
