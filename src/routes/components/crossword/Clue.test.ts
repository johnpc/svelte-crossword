import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Clue from './Clue.svelte';

const base = {
	number: 1,
	clue: 'Feline',
	custom: '',
	isFilled: false
};

describe('Clue', () => {
	it('renders the number and clue text', () => {
		const { getByText } = render(Clue, { props: base });
		expect(getByText('1')).toBeInTheDocument();
		expect(getByText(/Feline/)).toBeInTheDocument();
	});

	it('applies focus and filled state classes', () => {
		const { container } = render(Clue, {
			props: {
				...base,
				isFilled: true,
				isNumberFocused: true,
				isDirectionFocused: true
			}
		});
		const button = container.querySelector('button');
		expect(button).toHaveClass('is-filled');
		expect(button).toHaveClass('is-number-focused');
		expect(button).toHaveClass('is-direction-focused');
	});

	it('calls onFocus when clicked', async () => {
		const onFocus = vi.fn();
		const { container } = render(Clue, { props: { ...base, onFocus } });
		await fireEvent.click(container.querySelector('button')!);
		expect(onFocus).toHaveBeenCalledOnce();
	});
});
