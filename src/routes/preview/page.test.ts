import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';

const mockIsNative = vi.fn().mockReturnValue(false);
vi.mock('@capacitor/core', () => ({
	Capacitor: { isNativePlatform: () => mockIsNative() }
}));

// Stub the heavy child (pulls amplify/aws-sdk) with a no-op Svelte 5 component.
// Svelte 5 invokes components as functions (anchor, props), not via `new`.
vi.mock('./PuzzlePreview.svelte', () => ({ default: () => {} }));

import Page from './+page.svelte';

describe('preview/+page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockIsNative.mockReturnValue(false);
	});

	it('renders the title and tagline', () => {
		const { getByText } = render(Page);
		expect(getByText('Small Crosswords')).toBeTruthy();
		expect(getByText('Enjoy unlimited mini crossword puzzles!')).toBeTruthy();
	});

	it('shows store install links on web (non-native)', () => {
		const { getByText } = render(Page);
		expect(getByText(/Install from App Store/)).toBeTruthy();
		expect(getByText(/Install from Google Play/)).toBeTruthy();
	});

	it('hides store install links on native platforms', () => {
		mockIsNative.mockReturnValue(true);
		const { queryByText } = render(Page);
		expect(queryByText(/Install from App Store/)).toBeNull();
		expect(queryByText(/Install from Google Play/)).toBeNull();
	});
});
