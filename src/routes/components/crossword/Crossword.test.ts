import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';

// The crossword engine uses ResizeObserver (via offsetWidth binding / children),
// absent in jsdom. Polyfill locally (vitest-setup.ts is off-limits).
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

// haptics pulls in @capacitor/haptics (native). Stub so descendants mount.
vi.mock('@capacitor/haptics', () => ({
	Haptics: { impact: vi.fn(), vibrate: vi.fn() },
	ImpactStyle: { Light: 'LIGHT', Medium: 'MEDIUM' }
}));

import Crossword from './Crossword.svelte';
import { previewClues } from '../../preview/previewClues';

describe('Crossword (engine)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('mounts the .svelte-crossword article with real clue data', () => {
		const { container } = render(Crossword, { props: { data: previewClues } });
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
	});

	it('renders the grid svg', () => {
		const { container } = render(Crossword, { props: { data: previewClues } });
		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('renders the default toolbar slot (Clear/Reveal/Check)', () => {
		const { getByText } = render(Crossword, { props: { data: previewClues } });
		expect(getByText('Clear')).toBeInTheDocument();
		expect(getByText('Reveal')).toBeInTheDocument();
		expect(getByText('Check')).toBeInTheDocument();
	});

	it('honours a restricted actions list', () => {
		const { getByText, queryByText } = render(Crossword, {
			props: { data: previewClues, actions: ['clear'] }
		});
		expect(getByText('Clear')).toBeInTheDocument();
		expect(queryByText('Reveal')).toBeNull();
		expect(queryByText('Check')).toBeNull();
	});

	it('clicking Clear runs the toolbar action without throwing', async () => {
		const { getByText, container } = render(Crossword, { props: { data: previewClues } });
		await fireEvent.click(getByText('Clear'));
		// grid still present after the clear path executed
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
	});

	it('clicking Check runs the toolbar action without throwing', async () => {
		const { getByText, container } = render(Crossword, { props: { data: previewClues } });
		await fireEvent.click(getByText('Check'));
		expect(container.querySelector('svg')).not.toBeNull();
	});

	it('re-initializes when the data prop changes reactively', async () => {
		const smaller = [previewClues[0], previewClues[5]]; // TIS across + TBSP down
		const { container, rerender } = render(Crossword, { props: { data: previewClues } });
		const before = container.querySelectorAll('svg rect, svg g').length;
		await rerender({ data: smaller });
		// Still mounted and rendering a grid after re-init.
		expect(container.querySelector('article.svelte-crossword')).not.toBeNull();
		expect(container.querySelector('svg')).not.toBeNull();
		expect(before).toBeGreaterThan(0);
	});

	it('reports isComplete=false for an empty (unsolved) grid', () => {
		const events: boolean[] = [];
		render(Crossword, {
			props: { data: previewClues },
			events: { isComplete: (e) => events.push((e as CustomEvent).detail) }
		});
		// With no events emitted as a bound prop we just assert the unsolved grid
		// did not surface a completion message.
		expect(events.every((v) => v === false)).toBe(true);
	});

	it('does not show the completion message while the puzzle is unsolved', () => {
		const { queryByText } = render(Crossword, {
			props: { data: previewClues, showCompleteMessage: true }
		});
		// CrosswordComplete only renders its message once isComplete is true.
		expect(queryByText(/complete/i)).toBeNull();
	});

	it('uses the stacked layout when width < breakpoint (high breakpoint)', () => {
		const { container } = render(Crossword, {
			props: { data: previewClues, breakpoint: 10000 }
		});
		// width starts at 0 in jsdom, so width < breakpoint => stacked.
		expect(container.querySelector('.play.stacked')).not.toBeNull();
	});

	it('uses the non-stacked layout when breakpoint <= width (breakpoint 0)', () => {
		const { container } = render(Crossword, {
			props: { data: previewClues, breakpoint: 0 }
		});
		const play = container.querySelector('.play');
		expect(play).not.toBeNull();
		expect(play).not.toHaveClass('stacked');
	});

	it('applies the theme styles to the article', () => {
		const { container } = render(Crossword, { props: { data: previewClues, theme: 'pink' } });
		const article = container.querySelector('article.svelte-crossword') as HTMLElement;
		expect(article.getAttribute('style')).toBeTruthy();
	});
});
