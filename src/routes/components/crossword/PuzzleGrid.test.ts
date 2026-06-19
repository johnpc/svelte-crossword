import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// Crossword engine relies on ResizeObserver, absent in jsdom.
vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);

import PuzzleGrid from './PuzzleGrid.svelte';
import type { Cell, Direction } from './helpers/types';

const cells: Cell[] = [
	{
		x: 0,
		y: 0,
		index: 0,
		value: '',
		answer: 'C',
		number: 1,
		custom: '',
		id: '0-0',
		clueNumbers: {}
	},
	{
		x: 1,
		y: 0,
		index: 1,
		value: '',
		answer: 'A',
		number: 0,
		custom: '',
		id: '1-0',
		clueNumbers: {}
	}
];

const makeProps = (overrides = {}) => ({
	cells,
	w: 2,
	h: 1,
	focusedCellIndex: 0,
	focusedCell: cells[0],
	focusedDirection: 'across' as Direction,
	isRevealing: false,
	isChecking: false,
	isDisableHighlight: false,
	revealDuration: 0,
	keyboardVisible: false,
	isLoaded: false,
	stacked: false,
	act: vi.fn(),
	onNativeKeydown: vi.fn(),
	...overrides
});

describe('PuzzleGrid', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the hidden input when keyboard is not visible', () => {
		const { container } = render(PuzzleGrid, { props: makeProps({ keyboardVisible: false }) });
		const input = container.querySelector('input[type="text"]');
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('aria-hidden', 'true');
	});

	it('does not render the hidden input when the keyboard is visible', () => {
		const { container } = render(PuzzleGrid, { props: makeProps({ keyboardVisible: true }) });
		expect(container.querySelector('input[type="text"]')).toBeNull();
	});

	it('calls onNativeKeydown when the hidden input receives a keydown', async () => {
		const onNativeKeydown = vi.fn();
		const { container } = render(PuzzleGrid, {
			props: makeProps({ keyboardVisible: false, onNativeKeydown })
		});
		await fireEvent.keyDown(container.querySelector('input[type="text"]')!, { key: 'a' });
		expect(onNativeKeydown).toHaveBeenCalledOnce();
	});

	it('applies stacked and is-loaded classes to the section', () => {
		const { container } = render(PuzzleGrid, {
			props: makeProps({ stacked: true, isLoaded: true })
		});
		const section = container.querySelector('section.puzzle');
		expect(section).toBeInTheDocument();
		expect(section).toHaveClass('stacked');
		expect(section).toHaveClass('is-loaded');
	});

	it('does not apply stacked/is-loaded classes when those props are false', () => {
		const { container } = render(PuzzleGrid, {
			props: makeProps({ stacked: false, isLoaded: false })
		});
		const section = container.querySelector('section.puzzle');
		expect(section).not.toHaveClass('stacked');
		expect(section).not.toHaveClass('is-loaded');
	});

	it('renders the cells (one svg <g> per cell)', () => {
		const { container } = render(PuzzleGrid, { props: makeProps() });
		expect(container.querySelectorAll('g.cell')).toHaveLength(cells.length);
	});

	it('exposes getElement() returning the section element', () => {
		const { component, container } = render(PuzzleGrid, { props: makeProps() });
		expect(component.getElement()).toBe(container.querySelector('section.puzzle'));
	});
});
