import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';
import CompletedMessage from './CompletedMessage.svelte';

describe('CompletedMessage', () => {
	it('renders the message and a dismiss button by default', () => {
		const { container, getByText } = render(CompletedMessage);
		expect(container.querySelector('.completed')).toBeInTheDocument();
		expect(getByText('View puzzle')).toBeInTheDocument();
	});

	it('renders the confetti container when showConfetti is true', () => {
		const { container } = render(CompletedMessage, { props: { showConfetti: true } });
		expect(container.querySelector('.confetti')).toBeInTheDocument();
	});

	it('omits the confetti container when showConfetti is false', () => {
		const { container } = render(CompletedMessage, { props: { showConfetti: false } });
		expect(container.querySelector('.confetti')).toBeNull();
	});

	it('hides itself when the dismiss button is clicked', async () => {
		const { container, getByText } = render(CompletedMessage);
		await fireEvent.click(getByText('View puzzle'));
		await waitFor(() => expect(container.querySelector('.completed')).toBeNull());
	});

	it('hides itself when the curtain is clicked', async () => {
		const { container } = render(CompletedMessage);
		const curtain = container.querySelector('.curtain');
		await fireEvent.click(curtain!);
		await waitFor(() => expect(container.querySelector('.completed')).toBeNull());
	});
});
