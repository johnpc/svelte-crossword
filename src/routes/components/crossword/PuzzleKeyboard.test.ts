import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

import PuzzleKeyboard from './PuzzleKeyboard.svelte';

describe('PuzzleKeyboard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the .keyboard wrapper containing the keyboard', () => {
		const { container } = render(PuzzleKeyboard, {
			props: { onKeydown: vi.fn(), keyboardStyle: 'outline' }
		});
		const wrapper = container.querySelector('.keyboard');
		expect(wrapper).toBeInTheDocument();
		expect(wrapper?.querySelector('.svelte-keyboard')).toBeInTheDocument();
	});

	it('forwards a key press to the onKeydown callback', async () => {
		const onKeydown = vi.fn();
		const { getByText } = render(PuzzleKeyboard, {
			props: { onKeydown, keyboardStyle: 'outline' }
		});
		await fireEvent.mouseDown(getByText('A'));
		expect(onKeydown).toHaveBeenCalledOnce();
		expect(onKeydown.mock.calls[0][0].detail).toBe('A');
	});
});
