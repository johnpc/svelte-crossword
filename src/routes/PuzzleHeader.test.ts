import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import PuzzleHeader from './PuzzleHeader.svelte';

const base = {
	email: 'player@example.com',
	puzzleTitle: '',
	puzzleAuthor: '',
	onSignOut: () => {}
};

describe('PuzzleHeader', () => {
	it('greets the user by the local part of their email', () => {
		const { getByText } = render(PuzzleHeader, { props: base });
		expect(getByText(/player/)).toBeInTheDocument();
	});

	it('shows puzzle title and author when provided', () => {
		const { getByText } = render(PuzzleHeader, {
			props: { ...base, puzzleTitle: 'Monday Mini', puzzleAuthor: 'Jane' }
		});
		expect(getByText('Monday Mini')).toBeInTheDocument();
		expect(getByText('by Jane')).toBeInTheDocument();
	});

	it('omits the puzzle-info block when title and author are empty', () => {
		const { container } = render(PuzzleHeader, { props: base });
		expect(container.querySelector('.puzzle-info')).toBeNull();
	});

	it('calls onSignOut when the sign out link is clicked', async () => {
		const onSignOut = vi.fn();
		const { getByText } = render(PuzzleHeader, { props: { ...base, onSignOut } });
		await fireEvent.click(getByText('sign out'));
		expect(onSignOut).toHaveBeenCalledOnce();
	});
});
