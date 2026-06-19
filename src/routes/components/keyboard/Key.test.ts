import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Key from './Key.svelte';

const base = {
	value: 'A',
	display: 'A',
	onKeyStart: () => {},
	onKeyEnd: () => {}
};

describe('Key', () => {
	it('renders the display text and value-based classes', () => {
		const { getByRole } = render(Key, { props: base });
		const button = getByRole('button');
		expect(button).toHaveTextContent('A');
		expect(button).toHaveClass('key--A');
		expect(button).toHaveClass('single');
	});

	it('renders raw SVG markup when display contains an svg', () => {
		const { container } = render(Key, {
			props: { ...base, value: 'Backspace', display: '<svg><rect /></svg>' }
		});
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	it('applies the active class', () => {
		const { getByRole } = render(Key, { props: { ...base, active: true } });
		expect(getByRole('button')).toHaveClass('active');
	});

	it('calls onKeyStart on mousedown and onKeyEnd on mouseup', async () => {
		const onKeyStart = vi.fn();
		const onKeyEnd = vi.fn();
		const { getByRole } = render(Key, { props: { ...base, onKeyStart, onKeyEnd } });
		const button = getByRole('button');
		await fireEvent.mouseDown(button);
		await fireEvent.mouseUp(button);
		expect(onKeyStart).toHaveBeenCalledWith(expect.anything(), 'A');
		expect(onKeyEnd).toHaveBeenCalledWith('A');
	});
});
