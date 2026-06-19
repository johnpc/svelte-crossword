import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// Clues -> ClueBar -> helpers/haptics -> @capacitor/haptics. Mock it.
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

import Clues from './Clues.svelte';
import type { Cell, Clue, Direction } from './helpers/types';

// Minimal clues fixture matching the enriched Clue shape used by the engine.
const clues: Clue[] = [
	{
		clue: 'Feline',
		answer: 'CAT',
		x: 0,
		y: 0,
		direction: 'across',
		number: 1,
		id: '0-0',
		index: 0,
		cells: [],
		custom: '',
		isFilled: false
	},
	{
		clue: 'Canine',
		answer: 'DOG',
		x: 0,
		y: 1,
		direction: 'across',
		number: 3,
		id: '0-1',
		index: 1,
		cells: [],
		custom: '',
		isFilled: false
	},
	{
		clue: 'Recipe qty.',
		answer: 'CUP',
		x: 0,
		y: 0,
		direction: 'down',
		number: 1,
		id: '0-0',
		index: 2,
		cells: [],
		custom: '',
		isFilled: false
	}
];

const cellIndexMap = { '0-0': 0, '0-1': 3 };

const base = {
	clues,
	cellIndexMap,
	focusedDirection: 'across' as Direction,
	focusedCellIndex: 0,
	focusedCell: { clueNumbers: { across: 1, down: 1 } } as unknown as Cell,
	stacked: false,
	isDisableHighlight: false,
	isLoaded: false
};

describe('Clues', () => {
	it('renders both the across and down direction lists', () => {
		const { getAllByText } = render(Clues, { props: base });
		// each direction label is rendered by its ClueList
		expect(getAllByText('across').length).toBeGreaterThanOrEqual(1);
		expect(getAllByText('down').length).toBeGreaterThanOrEqual(1);
	});

	it('renders each clue under the appropriate direction list', () => {
		const { getAllByText, getByText } = render(Clues, { props: base });
		// "Feline" appears in both the clue bar and the across list.
		expect(getAllByText(/Feline/).length).toBeGreaterThanOrEqual(1);
		expect(getByText(/Canine/)).toBeInTheDocument();
		expect(getByText(/Recipe qty\./)).toBeInTheDocument();
	});

	it('shows the focused clue in the clue bar', () => {
		const { container } = render(Clues, { props: base });
		// currentClue resolves to the across clue numbered 1 ("Feline"); the
		// clue bar <p> shows that text.
		const bar = container.querySelector('.bar .clue-text');
		expect(bar?.textContent).toContain('Feline');
	});

	it('updates the focused direction to down when a down clue is clicked', async () => {
		const { getByText, container } = render(Clues, { props: base });
		// initially the across clue ("Feline") is focused in the bar
		expect(container.querySelector('.bar .clue-text')?.textContent).toContain('Feline');
		await fireEvent.click(getByText(/Recipe qty\./));
		// clicking the down clue (id 0-0) switches focusedDirection to 'down';
		// the bar now reflects the down clue numbered 1 ("Recipe qty.").
		expect(container.querySelector('.bar .clue-text')?.textContent).toContain('Recipe qty.');
	});

	it('focuses the clicked clue button (is-direction-focused) after a click', async () => {
		const { getByText, container } = render(Clues, { props: base });
		const recipeButton = getByText(/Recipe qty\./).closest('button');
		// before the click the down list is not the focused direction
		expect(recipeButton).not.toHaveClass('is-direction-focused');
		await fireEvent.click(recipeButton!);
		// after the click the down direction (and clue) is focused
		expect(container.querySelector('.bar .clue-text')?.textContent).toContain('Recipe qty.');
		expect(recipeButton).toHaveClass('is-direction-focused');
	});
});
