import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readable } from 'svelte/store';
import { render, fireEvent } from '@testing-library/svelte';

vi.mock('$app/stores', () => ({
	page: readable({ url: new URL('http://localhost/') })
}));

const mockApply = vi.fn();
const mockCycle = vi.fn().mockReturnValue('dark');
const mockGetStored = vi.fn().mockReturnValue('system');
vi.mock('./helpers/themeManager', () => ({
	getStoredTheme: () => mockGetStored(),
	applyTheme: (t: string) => mockApply(t),
	cycleTheme: (t: string) => mockCycle(t),
	getThemeIcon: () => '🌙'
}));

vi.mock('$lib/images/logo.png', () => ({ default: 'logo.png' }));
vi.mock('$lib/images/github.svg', () => ({ default: 'github.svg' }));

import Header from './Header.svelte';

describe('Header', () => {
	beforeEach(() => vi.clearAllMocks());

	it('applies the stored theme on mount', () => {
		render(Header);
		expect(mockGetStored).toHaveBeenCalled();
		expect(mockApply).toHaveBeenCalledWith('system');
	});

	it('cycles and applies a new theme when toggled', async () => {
		const { getByTitle } = render(Header);
		await fireEvent.click(getByTitle('Toggle theme'));
		expect(mockCycle).toHaveBeenCalled();
		expect(mockApply).toHaveBeenCalledWith('dark');
	});
});
