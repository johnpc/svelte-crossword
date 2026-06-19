import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Toolbar from './Toolbar.svelte';

describe('Toolbar', () => {
	it('renders a button for each default action', () => {
		const { getByText } = render(Toolbar);
		expect(getByText('Clear')).toBeInTheDocument();
		expect(getByText('Reveal')).toBeInTheDocument();
		expect(getByText('Check')).toBeInTheDocument();
	});

	it('renders only the requested actions', () => {
		const { getByText, queryByText } = render(Toolbar, { props: { actions: ['check'] } });
		expect(getByText('Check')).toBeInTheDocument();
		expect(queryByText('Clear')).toBeNull();
		expect(queryByText('Reveal')).toBeNull();
	});

	it('dispatches an event with the action name on click', async () => {
		const handler = vi.fn();
		const { getByText } = render(Toolbar, {
			events: { event: (e: CustomEvent) => handler(e.detail) }
		});
		await fireEvent.click(getByText('Reveal'));
		expect(handler).toHaveBeenCalledWith('reveal');
	});
});
