import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/svelte';

// Crossword engine relies on ResizeObserver, absent in jsdom.
vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);

// haptics pulls in @capacitor/haptics (native); stub for engine + vibrate().
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

// svelte-toast: stub component, spy push.
vi.mock('@zerodevx/svelte-toast', () => ({
	SvelteToast: vi.fn(),
	toast: { push: vi.fn() }
}));

// $app/navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({ goto: (...a: unknown[]) => mockGoto(...a) }));

// auth: reject so the preview stays put (not logged in).
const getCurrentUser = vi.fn(() => Promise.reject(new Error('not signed in')));
vi.mock('aws-amplify/auth', () => ({
	getCurrentUser: () => getCurrentUser()
}));

import PuzzlePreview from './PuzzlePreview.svelte';

describe('preview/PuzzlePreview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getCurrentUser.mockImplementation(() => Promise.reject(new Error('not signed in')));
		localStorage.clear();
	});

	it('shows the SyncLoader spinner before clues load', () => {
		const { container } = render(PuzzlePreview);
		// no clues yet -> the loading paragraph, no "not signed in" heading.
		expect(container.querySelector('p')).not.toBeNull();
		expect(container.querySelector('article.svelte-crossword')).toBeNull();
	});

	it('renders the "not signed in" UI and the crossword once clues load', async () => {
		const { container, getByText } = render(PuzzlePreview);
		await waitFor(() => {
			expect(getByText("You're not signed in!")).toBeInTheDocument();
		});
		expect(getByText('sign in/up')).toBeInTheDocument();
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('renders the toolbar (Clear/Reveal/Check) from PreviewCrossword', async () => {
		const { getByText } = render(PuzzlePreview);
		await waitFor(() => {
			expect(getByText('Clear')).toBeInTheDocument();
		});
		expect(getByText('Reveal')).toBeInTheDocument();
		expect(getByText('Check')).toBeInTheDocument();
	});

	it('navigates to /login when the sign in button is clicked', async () => {
		const { getByText } = render(PuzzlePreview);
		await waitFor(() => expect(getByText('sign in/up')).toBeInTheDocument());
		await fireEvent.click(getByText('sign in/up'));
		expect(mockGoto).toHaveBeenCalledWith('/login');
	});

	it('redirects to "/" when getCurrentUser resolves with a user id', async () => {
		getCurrentUser.mockImplementation(() => Promise.resolve({ userId: 'u1' }) as never);
		render(PuzzlePreview);
		await waitFor(() => {
			expect(mockGoto).toHaveBeenCalledWith('/');
		});
	});
});
