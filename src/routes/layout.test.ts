import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readable } from 'svelte/store';
import { render } from '@testing-library/svelte';

// Mock leaf deps of the real Header so it mounts without network/asset errors.
vi.mock('$app/stores', () => ({
	page: readable({ url: new URL('http://localhost/') })
}));
vi.mock('$lib/images/logo.png', () => ({ default: 'logo.png' }));
vi.mock('$lib/images/github.svg', () => ({ default: 'github.svg' }));
vi.mock('./helpers/themeManager', () => ({
	getStoredTheme: () => 'system',
	applyTheme: vi.fn(),
	cycleTheme: () => 'light',
	getThemeIcon: () => '💻'
}));

// SvelteToast pulls in animation/store machinery we don't want to exercise.
vi.mock('@zerodevx/svelte-toast', () => ({ SvelteToast: vi.fn(), toast: { push: vi.fn() } }));

import Layout from './+layout.svelte';

describe('+layout', () => {
	beforeEach(() => vi.clearAllMocks());

	it('renders the footer "Made with" text', () => {
		const { getByText } = render(Layout);
		expect(getByText(/Made with/)).toBeTruthy();
	});

	it('renders the support email link', () => {
		const { getByText } = render(Layout);
		const link = getByText('support@smallcrosswords.com');
		expect(link.getAttribute('href')).toBe('mailto:support@smallcrosswords.com');
	});
});
