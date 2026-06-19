import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

import Keyboard from './Keyboard.svelte';

describe('Keyboard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the letter keys for the default crossword layout', () => {
		const { getByText } = render(Keyboard);
		// Crossword layout uppercases single-char letters into their `value`,
		// and (unswapped) the display equals the value.
		for (const letter of ['A', 'S', 'D', 'F']) {
			expect(getByText(letter)).toBeInTheDocument();
		}
	});

	it('dispatches a keydown event with the letter value when a letter key is pressed', async () => {
		const spy = vi.fn();
		const { getByText } = render(Keyboard, {
			events: { keydown: (e: CustomEvent) => spy(e.detail) }
		});
		await fireEvent.mouseDown(getByText('A'));
		expect(spy).toHaveBeenCalledWith('A');
	});

	it('toggles to the symbols/numbers page when the page toggle key is pressed', async () => {
		const { getByText, container } = render(Keyboard);
		const pages = () => Array.from(container.querySelectorAll('.page'));
		// Page 0 (letters) is visible by default; page 1 (symbols/numbers) is not.
		expect(pages()[0]).toHaveClass('visible');
		expect(pages()[1]).not.toHaveClass('visible');
		// The number key lives on the (initially hidden) second page.
		expect(pages()[1].contains(getByText('1'))).toBe(true);
		// The toggle key has value "Page1"; its display is swapped to "?123".
		await fireEvent.mouseDown(getByText('?123'));
		// After toggling, the symbols/numbers page becomes visible.
		expect(pages()[0]).not.toHaveClass('visible');
		expect(pages()[1]).toHaveClass('visible');
	});

	it('does not dispatch keydown when the page toggle key is pressed', async () => {
		const spy = vi.fn();
		const { getByText } = render(Keyboard, {
			events: { keydown: (e: CustomEvent) => spy(e.detail) }
		});
		await fireEvent.mouseDown(getByText('?123'));
		expect(spy).not.toHaveBeenCalled();
	});
});
