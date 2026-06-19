import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ClueList from './ClueList.svelte';

const clues = [
	{ number: 1, clue: 'Feline', custom: '', isFilled: false },
	{ number: 2, clue: 'Officer', custom: '', isFilled: true }
];

const base = {
	direction: 'across',
	clues,
	focusedClueNumbers: { across: 1, down: null },
	isDirectionFocused: true,
	isDisableHighlight: false,
	onClueFocus: () => {}
};

describe('ClueList', () => {
	it('renders the direction label and one entry per clue', () => {
		const { getByText } = render(ClueList, { props: base });
		expect(getByText('across')).toBeInTheDocument();
		expect(getByText(/Feline/)).toBeInTheDocument();
		expect(getByText(/Officer/)).toBeInTheDocument();
	});

	it('invokes onClueFocus with the clicked clue', async () => {
		const onClueFocus = vi.fn();
		const { getByText } = render(ClueList, { props: { ...base, onClueFocus } });
		await fireEvent.click(getByText(/Officer/));
		expect(onClueFocus).toHaveBeenCalledWith(clues[1]);
	});
});
