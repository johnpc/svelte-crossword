import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// The real Crossword child uses ResizeObserver, which jsdom does not implement.
// Polyfill it locally (vitest-setup.ts is off-limits) so the engine can mount.
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

// svelte-toast: stub the component, spy the toast api (we don't assert on push here).
vi.mock('@zerodevx/svelte-toast', () => ({
	SvelteToast: vi.fn(),
	toast: { push: vi.fn() }
}));

// haptics pulls in @capacitor/haptics (native); stub the toolbarActions' side effect.
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Medium: 'MEDIUM' }
}));

import PreviewCrossword from './PreviewCrossword.svelte';
import { previewClues } from './previewClues';

const makeProps = (overrides = {}) => ({
	clues: previewClues,
	ref: undefined,
	showAppKeyboard: false,
	isPuzzleComplete: false,
	keyboardStyle: 'outline' as const,
	timeInSeconds: 65,
	usedClear: false,
	usedReveal: false,
	usedCheck: false,
	onToggleKeyboard: vi.fn(),
	onShowToast: vi.fn(),
	toastOptions: { duration: 4000 },
	...overrides
});

describe('PreviewCrossword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the toolbar slot with the human-readable timer', () => {
		const { getByText } = render(PreviewCrossword, { props: makeProps({ timeInSeconds: 65 }) });
		// 65s -> "1m 5s"
		expect(getByText(/1m\s+5s/)).toBeInTheDocument();
	});

	it('renders the Clear/Reveal/Check toolbar buttons', () => {
		const { getByText } = render(PreviewCrossword, { props: makeProps() });
		expect(getByText('Clear')).toBeInTheDocument();
		expect(getByText('Reveal')).toBeInTheDocument();
		expect(getByText('Check')).toBeInTheDocument();
	});

	it('calls onToggleKeyboard when the toggle button is clicked', async () => {
		const onToggleKeyboard = vi.fn();
		const { getByTitle } = render(PreviewCrossword, { props: makeProps({ onToggleKeyboard }) });
		await fireEvent.click(getByTitle('Toggle keyboard'));
		expect(onToggleKeyboard).toHaveBeenCalledOnce();
	});

	it('shows the phone glyph when showAppKeyboard is false', () => {
		const { getByTitle } = render(PreviewCrossword, {
			props: makeProps({ showAppKeyboard: false })
		});
		expect(getByTitle('Toggle keyboard').textContent?.trim()).toBe('📱');
	});

	it('shows the keyboard glyph when showAppKeyboard is true', () => {
		const { getByTitle } = render(PreviewCrossword, {
			props: makeProps({ showAppKeyboard: true })
		});
		expect(getByTitle('Toggle keyboard').textContent?.trim()).toBe('⌨️');
	});

	it('marks the Clear button active after it is clicked', async () => {
		const { getByText } = render(PreviewCrossword, { props: makeProps() });
		const clear = getByText('Clear');
		expect(clear).not.toHaveClass('active');
		await fireEvent.click(clear);
		expect(clear).toHaveClass('active');
	});

	it('marks the Reveal button active after it is clicked', async () => {
		const { getByText } = render(PreviewCrossword, { props: makeProps() });
		const reveal = getByText('Reveal');
		expect(reveal).not.toHaveClass('active');
		await fireEvent.click(reveal);
		expect(reveal).toHaveClass('active');
	});

	it('marks the Check button active after it is clicked', async () => {
		const { getByText } = render(PreviewCrossword, { props: makeProps() });
		const check = getByText('Check');
		expect(check).not.toHaveClass('active');
		await fireEvent.click(check);
		expect(check).toHaveClass('active');
	});

	it('renders Clear/Reveal/Check already active when their used* props are true', () => {
		const { getByText } = render(PreviewCrossword, {
			props: makeProps({ usedClear: true, usedReveal: true, usedCheck: true })
		});
		expect(getByText('Clear')).toHaveClass('active');
		expect(getByText('Reveal')).toHaveClass('active');
		expect(getByText('Check')).toHaveClass('active');
	});

	it('hides the Continue button when the puzzle is not complete', () => {
		const { queryByText } = render(PreviewCrossword, {
			props: makeProps({ isPuzzleComplete: false })
		});
		expect(queryByText('Continue')).toBeNull();
	});

	it('shows the Continue button and calls onShowToast when complete', async () => {
		const onShowToast = vi.fn();
		const { getByText } = render(PreviewCrossword, {
			props: makeProps({ isPuzzleComplete: true, onShowToast })
		});
		const cont = getByText('Continue');
		expect(cont).toBeInTheDocument();
		await fireEvent.click(cont);
		expect(onShowToast).toHaveBeenCalledOnce();
	});
});
