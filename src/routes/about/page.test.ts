import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';

vi.mock('$lib/images/silas.jpeg', () => ({ default: 'silas.jpeg' }));

import Page from './+page.svelte';

describe('about/+page', () => {
	it('renders the about heading and founder bio', () => {
		const { getByText, getByRole } = render(Page);
		expect(getByText('About Small Crosswords')).toBeTruthy();
		expect(getByText('Meet Silas Bush, Founder of Small Crosswords')).toBeTruthy();
		expect(getByRole('img', { name: 'Silas' })).toBeTruthy();
	});

	it('links to the GitHub source code', () => {
		const { getByRole } = render(Page);
		const link = getByRole('link', { name: 'GitHub' });
		expect(link.getAttribute('href')).toBe('https://github.com/johnpc/svelte-crossword');
	});
});
