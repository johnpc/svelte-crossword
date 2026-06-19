import { describe, it, expect, vi } from 'vitest';
import { readable } from 'svelte/store';
import { render, fireEvent } from '@testing-library/svelte';

vi.mock('$app/stores', () => ({
	page: readable({ url: new URL('http://localhost/') })
}));

import HeaderNav from './HeaderNav.svelte';

describe('HeaderNav', () => {
	it('renders navigation links', () => {
		const { getByText } = render(HeaderNav, {
			props: { theme: 'system', onToggleTheme: () => {} }
		});
		expect(getByText('Home')).toBeInTheDocument();
		expect(getByText('Leaderboard')).toBeInTheDocument();
	});

	it('marks the current route as the active page', () => {
		const { getByText } = render(HeaderNav, {
			props: { theme: 'system', onToggleTheme: () => {} }
		});
		expect(getByText('Home').closest('li')).toHaveAttribute('aria-current', 'page');
		expect(getByText('Leaderboard').closest('li')).not.toHaveAttribute('aria-current');
	});

	it('calls onToggleTheme when the theme button is clicked', async () => {
		const onToggleTheme = vi.fn();
		const { getByTitle } = render(HeaderNav, { props: { theme: 'dark', onToggleTheme } });
		await fireEvent.click(getByTitle('Toggle theme'));
		expect(onToggleTheme).toHaveBeenCalledOnce();
	});
});
