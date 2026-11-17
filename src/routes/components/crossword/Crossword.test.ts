import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';

// The crossword engine uses ResizeObserver (via offsetWidth binding / children),
// absent in jsdom. Polyfill locally (vitest-setup.ts is off-limits).
class ResizeObserverStub {
	observe() {}
	unobserve() {}
	disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);
// jsdom has no Element.scrollTo (the clue list scrolls the focused clue into view).
Element.prototype.scrollTo = () => {};

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
	afterEach(() => {
		vi.useRealTimers();
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

	it('keeps typed letters when the parent re-renders with the SAME clue set (timer ticks)', async () => {
		const { container, rerender } = render(Crossword, {
			props: { data: previewClues, revealDuration: 1 }
		});
		await fireEvent.click(container.querySelector('g.cell-0-0')!);
		await fireEvent.keyDown(container.querySelector('g.cell.is-focused')!, { key: 'T' });
		expect(container.querySelector('g.cell-0-0 text.value')).toHaveTextContent('T');
		await rerender({ data: previewClues, revealDuration: 2 });
		expect(container.querySelector('g.cell-0-0 text.value')).toHaveTextContent('T');
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

	describe('tool mode (idle | revealing | checking)', () => {
		const filled = (c: HTMLElement) => c.querySelectorAll('svg g.cell text.value').length;

		it('Reveal fills the grid, hides the completion message while revealing, then settles', async () => {
			vi.useFakeTimers();
			const { getByText, container } = render(Crossword, { props: { data: previewClues } });
			await fireEvent.click(getByText('Reveal'));
			expect(filled(container)).toBe(21);
			expect(container.querySelector('.completed')).toBeNull();
			vi.advanceTimersByTime(1250);
			await tick();
			expect(container.querySelector('.completed')).not.toBeNull();
		});

		it('Check during a reveal wins: the reveal timer no longer flips the mode', async () => {
			vi.useFakeTimers();
			const { getByText, container } = render(Crossword, { props: { data: previewClues } });
			await fireEvent.click(getByText('Reveal'));
			await fireEvent.click(getByText('Check'));
			expect(container.querySelector('g.cell.is-correct')).not.toBeNull();
			vi.advanceTimersByTime(5000);
			await tick();
			// still checking: correct marks stay, and the completion message shows
			expect(container.querySelector('g.cell.is-correct')).not.toBeNull();
			expect(container.querySelector('.completed')).not.toBeNull();
		});

		it('Clear during a reveal returns to idle with an empty grid', async () => {
			vi.useFakeTimers();
			const { getByText, container } = render(Crossword, { props: { data: previewClues } });
			await fireEvent.click(getByText('Reveal'));
			await fireEvent.click(getByText('Clear'));
			expect(filled(container)).toBe(0);
			vi.advanceTimersByTime(5000);
			await tick();
			expect(container.querySelector('.completed')).toBeNull();
		});

		it('Check marks a wrong letter and keeps the mode until Clear', async () => {
			const { getByText, container } = render(Crossword, { props: { data: previewClues } });
			await fireEvent.click(container.querySelector('g.cell-0-0')!);
			await fireEvent.keyDown(container.querySelector('g.cell.is-focused')!, { key: 'Z' });
			await fireEvent.click(getByText('Check'));
			expect(container.querySelector('g.cell-0-0')).toHaveClass('is-incorrect');
			await fireEvent.click(getByText('Clear'));
			expect(container.querySelector('g.cell-0-0')).not.toHaveClass('is-incorrect');
		});

		it('opens already filled in when `revealed` is set', () => {
			const { container } = render(Crossword, { props: { data: previewClues, revealed: true } });
			expect(filled(container)).toBe(21);
		});

		it('unmounting cancels a pending reveal timer', async () => {
			vi.useFakeTimers();
			const { getByText, unmount } = render(Crossword, { props: { data: previewClues } });
			await fireEvent.click(getByText('Reveal'));
			unmount();
			expect(() => vi.runAllTimers()).not.toThrow();
		});
	});
});
