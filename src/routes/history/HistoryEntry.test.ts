import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({ goto: (...args: unknown[]) => mockGoto(...args) }));

import HistoryEntry from './HistoryEntry.svelte';

const base = {
	id: 'up-1',
	usedCheck: false,
	usedClear: false,
	usedReveal: false,
	timeInSeconds: 90,
	createdAt: '2024-01-15T12:00:00.000Z'
};

describe('HistoryEntry', () => {
	it('shows only the used-feature badges that apply', () => {
		const { getByText, queryByText } = render(HistoryEntry, {
			props: { ...base, usedCheck: true }
		});
		expect(getByText(/Used Check/)).toBeInTheDocument();
		expect(queryByText(/Used Clear/)).toBeNull();
		expect(queryByText(/Used Reveal/)).toBeNull();
	});

	it('shows all badges when every feature was used', () => {
		const { getByText } = render(HistoryEntry, {
			props: { ...base, usedCheck: true, usedClear: true, usedReveal: true }
		});
		expect(getByText(/Used Check/)).toBeInTheDocument();
		expect(getByText(/Used Clear/)).toBeInTheDocument();
		expect(getByText(/Used Reveal/)).toBeInTheDocument();
	});

	it('navigates to the puzzle detail page on click', async () => {
		const { getByRole } = render(HistoryEntry, { props: base });
		await fireEvent.click(getByRole('link'));
		expect(mockGoto).toHaveBeenCalledWith('/history/id?id=up-1');
	});
});
