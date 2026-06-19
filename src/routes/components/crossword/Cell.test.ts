import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

import Cell from './Cell.svelte';

const makeProps = (overrides = {}) => ({
	x: 0,
	y: 0,
	index: 3,
	value: '',
	answer: 'A',
	number: 1,
	custom: '',
	changeDelay: 0,
	isRevealing: false,
	isChecking: false,
	isFocused: false,
	isSecondarilyFocused: false,
	preventFocus: true, // avoid element.focus() side effects unless a test opts in
	onFocusCell: vi.fn(),
	onCellUpdate: vi.fn(),
	onFocusClueDiff: vi.fn(),
	onMoveFocus: vi.fn(),
	onFlipDirection: vi.fn(),
	onHistoricalChange: vi.fn(),
	...overrides
});

describe('Cell', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders an svg <g> cell with positional and custom classes', () => {
		const { container } = render(Cell, { props: makeProps({ x: 2, y: 4, custom: 'block' }) });
		const g = container.querySelector('g.cell');
		expect(g).toBeInTheDocument();
		expect(g).toHaveClass('block');
		expect(g).toHaveClass('cell-2-4');
		expect(g?.getAttribute('transform')).toBe('translate(2, 4)');
	});

	it('applies the is-focused class when focused', () => {
		const { container } = render(Cell, { props: makeProps({ isFocused: true }) });
		expect(container.querySelector('g.cell')).toHaveClass('is-focused');
	});

	it('applies the is-secondarily-focused class when secondarily focused', () => {
		const { container } = render(Cell, { props: makeProps({ isSecondarilyFocused: true }) });
		expect(container.querySelector('g.cell')).toHaveClass('is-secondarily-focused');
	});

	it('renders the number via CellText', () => {
		const { container } = render(Cell, { props: makeProps({ number: 7 }) });
		expect(container.querySelector('text.number')?.textContent).toBe('7');
	});

	it('renders the value via CellText when present', () => {
		const { container } = render(Cell, { props: makeProps({ value: 'Z' }) });
		expect(container.querySelector('text.value')?.textContent?.trim()).toBe('Z');
	});

	it('does not render a value text node when value is empty', () => {
		const { container } = render(Cell, { props: makeProps({ value: '' }) });
		expect(container.querySelector('text.value')).toBeNull();
	});

	it('marks the cell correct when checking and value matches answer', () => {
		const { container } = render(Cell, {
			props: makeProps({ isChecking: true, value: 'A', answer: 'A' })
		});
		const g = container.querySelector('g.cell');
		expect(g).toHaveClass('is-correct');
		expect(g).not.toHaveClass('is-incorrect');
		expect(container.querySelector('line')).toBeNull();
	});

	it('marks the cell incorrect (and draws a slash line) when checking and value differs', () => {
		const { container } = render(Cell, {
			props: makeProps({ isChecking: true, value: 'B', answer: 'A' })
		});
		const g = container.querySelector('g.cell');
		expect(g).toHaveClass('is-incorrect');
		expect(g).not.toHaveClass('is-correct');
		expect(container.querySelector('line')).toBeInTheDocument();
	});

	it('calls onFocusCell with the index when clicked', async () => {
		const onFocusCell = vi.fn();
		const { container } = render(Cell, { props: makeProps({ index: 5, onFocusCell }) });
		await fireEvent.click(container.querySelector('g.cell')!);
		expect(onFocusCell).toHaveBeenCalledWith(5);
	});

	it('calls onCellUpdate with the uppercased letter on a letter keydown', async () => {
		const onCellUpdate = vi.fn();
		const { container } = render(Cell, { props: makeProps({ index: 2, onCellUpdate }) });
		await fireEvent.keyDown(container.querySelector('g.cell')!, { key: 'c' });
		expect(onCellUpdate).toHaveBeenCalledWith(2, 'C');
	});

	it('calls onCellUpdate to delete on Backspace', async () => {
		const onCellUpdate = vi.fn();
		const { container } = render(Cell, { props: makeProps({ index: 2, onCellUpdate }) });
		await fireEvent.keyDown(container.querySelector('g.cell')!, { key: 'Backspace' });
		expect(onCellUpdate).toHaveBeenCalledWith(2, '', -1, true);
	});

	it('calls onMoveFocus with direction/diff on an arrow keydown', async () => {
		const onMoveFocus = vi.fn();
		const { container } = render(Cell, { props: makeProps({ onMoveFocus }) });
		await fireEvent.keyDown(container.querySelector('g.cell')!, { key: 'ArrowRight' });
		expect(onMoveFocus).toHaveBeenCalledWith('across', 1);
	});

	it('calls onFlipDirection when space is pressed', async () => {
		const onFlipDirection = vi.fn();
		const { container } = render(Cell, { props: makeProps({ onFlipDirection }) });
		await fireEvent.keyDown(container.querySelector('g.cell')!, { key: ' ' });
		expect(onFlipDirection).toHaveBeenCalledOnce();
	});

	it('calls onFocusClueDiff when Tab is pressed', async () => {
		const onFocusClueDiff = vi.fn();
		const { container } = render(Cell, { props: makeProps({ onFocusClueDiff }) });
		await fireEvent.keyDown(container.querySelector('g.cell')!, { key: 'Tab' });
		expect(onFocusClueDiff).toHaveBeenCalledWith(1);
	});

	it('calls onHistoricalChange on ctrl+z', async () => {
		const onHistoricalChange = vi.fn();
		const { container } = render(Cell, { props: makeProps({ onHistoricalChange }) });
		await fireEvent.keyDown(container.querySelector('g.cell')!, { key: 'z', ctrlKey: true });
		expect(onHistoricalChange).toHaveBeenCalledWith(-1);
	});

	it('does nothing on a keydown with no mapped action', async () => {
		const onCellUpdate = vi.fn();
		const onMoveFocus = vi.fn();
		const { container } = render(Cell, { props: makeProps({ onCellUpdate, onMoveFocus }) });
		// Alt-modified key returns null -> no action
		await fireEvent.keyDown(container.querySelector('g.cell')!, { key: 'a', altKey: true });
		expect(onCellUpdate).not.toHaveBeenCalled();
		expect(onMoveFocus).not.toHaveBeenCalled();
	});
});
