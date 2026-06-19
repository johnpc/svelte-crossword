import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// haptics pulls in @capacitor/haptics; mock it so buttonHandler doesn't blow up.
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

import ClueBar from './ClueBar.svelte';

const currentClue = {
	clue: 'Feline pet',
	answer: 'CAT',
	index: 3,
	custom: ''
};

describe('ClueBar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the focused clue text', () => {
		const { getByText } = render(ClueBar, { props: { currentClue } });
		expect(getByText('Feline pet')).toBeInTheDocument();
	});

	it('applies the custom class to the bar', () => {
		const { container } = render(ClueBar, {
			props: { currentClue: { ...currentClue, custom: 'rotational' } }
		});
		const bar = container.querySelector('.bar');
		expect(bar).toHaveClass('rotational');
	});

	it('dispatches nextClue with the next index when the right button is clicked', async () => {
		const onNextClue = vi.fn();
		const { getByLabelText } = render(ClueBar, {
			props: { currentClue },
			events: { nextClue: (e) => onNextClue(e.detail) }
		});
		await fireEvent.click(getByLabelText('Next clue'));
		expect(onNextClue).toHaveBeenCalledWith(currentClue.index + 1);
	});

	it('dispatches nextClue with the previous index when the left button is clicked', async () => {
		const onNextClue = vi.fn();
		const { getByLabelText } = render(ClueBar, {
			props: { currentClue },
			events: { nextClue: (e) => onNextClue(e.detail) }
		});
		await fireEvent.click(getByLabelText('Previous clue'));
		expect(onNextClue).toHaveBeenCalledWith(currentClue.index - 1);
	});

	it('dispatches clueBarClicked with the current clue when the clue text is clicked', async () => {
		const onClueBarClicked = vi.fn();
		const { getByText } = render(ClueBar, {
			props: { currentClue },
			events: { clueBarClicked: (e) => onClueBarClicked(e.detail) }
		});
		await fireEvent.click(getByText('Feline pet'));
		expect(onClueBarClicked).toHaveBeenCalledWith(currentClue);
	});
});
