/**
 * Real-user walkthrough with evidence: screenshots per step, a video of the
 * whole run (Playwright recordVideo) and timings for the moments a person
 * actually waits on. Output lands in artifacts/walkthrough/.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { expect, type Page } from '@playwright/test';
import { test } from '../fixtures';
import { ADA } from '../fake-backend/install';
import { PREVIEW_MINI, WORD_SQUARE } from '../fake-backend/puzzles';

const OUT = 'artifacts/walkthrough';
mkdirSync(OUT, { recursive: true });

const timings: Record<string, number> = {};
let shot = 0;
const snap = (page: Page, name: string) =>
	page.screenshot({
		path: `${OUT}/${String(++shot).padStart(2, '0')}-${name}.png`,
		fullPage: true
	});
const timed = async (name: string, run: () => Promise<unknown>) => {
	const start = Date.now();
	await run();
	timings[name] = Date.now() - start;
};
const dismissCompletion = async (page: Page) => {
	await page.getByRole('button', { name: 'View puzzle' }).click();
	await expect(page.locator('.completed')).toHaveCount(0);
};
const type = async (page: Page, letters: string) => {
	for (const letter of letters) await page.keyboard.press(letter);
};

test.afterAll(() => {
	writeFileSync(`${OUT}/timings.json`, JSON.stringify(timings, null, 2));
});

test('anonymous visitor: preview puzzle, check, clear, solve', async ({ page }) => {
	await timed('preview: goto -> grid visible', async () => {
		await page.goto('/preview');
		await expect(page.locator('article.svelte-crossword section.puzzle svg')).toBeVisible();
	});
	await snap(page, 'preview-loaded');
	await page.locator('g.cell-0-0').click();
	await timed('preview: type a wrong letter -> rendered', async () => {
		await page.keyboard.press('Z');
		await expect(page.locator('g.cell-0-0 text.value')).toHaveText('Z');
	});
	await page.getByRole('button', { name: 'Check' }).click();
	await expect(page.locator('g.cell-0-0')).toHaveClass(/is-incorrect/);
	await snap(page, 'preview-check-marks-wrong-letter');
	await page.getByRole('button', { name: 'Clear' }).click();
	// Clear re-homes the cursor on the first square; clicking the already-focused
	// square toggles direction (NYT convention), so step via a neighbour.
	await page.locator('g.cell-1-0').click();
	await page.locator('g.cell-0-0').click();
	await timed('preview: type full solution -> completion message', async () => {
		await type(page, PREVIEW_MINI.typing);
		await expect(page.locator('.completed .message')).toContainText('solved');
	});
	await snap(page, 'preview-solved');
	await dismissCompletion(page);
	await page.getByRole('button', { name: 'Continue' }).click();
	await expect(page.locator('._toastMsg').first()).toContainText('Sign in');
	await expect(page.locator('._toastMsg')).toHaveCount(1);
	await snap(page, 'preview-continue-toast');
});

test('sign in through the form, then play to the end', async ({ page, backend }) => {
	await page.goto('/login');
	await snap(page, 'login-form');
	await page.locator('#email').fill(ADA.email);
	await page.locator('#password').fill(ADA.password);
	await timed('login: submit -> puzzle grid on home', async () => {
		await page.locator('#loginForm button[type="submit"]').click();
		await expect(page.locator('article.svelte-crossword section.puzzle svg')).toBeVisible();
	});
	await expect(page.locator('.puzzle-title')).toHaveText(PREVIEW_MINI.title);
	await snap(page, 'home-first-puzzle');
	await expect(page.locator('#timer')).toHaveText(/[1-9]\d*s/);
	await page.locator('g.cell-0-0').click();
	await timed('home: solve puzzle 1 -> completion message', async () => {
		await type(page, PREVIEW_MINI.typing);
		await expect(page.locator('.completed .message')).toContainText('solved');
	});
	await snap(page, 'home-first-puzzle-solved');
	await dismissCompletion(page);
	await timed('home: Continue -> next puzzle grid', async () => {
		await page.getByRole('button', { name: 'Continue' }).click();
		await expect(page.locator('.puzzle-title')).toHaveText(WORD_SQUARE.title);
	});
	await snap(page, 'home-second-puzzle');
	await page.locator('g.cell-0-0').click();
	await type(page, WORD_SQUARE.typing);
	await expect(page.locator('.completed .message')).toContainText('solved');
	await dismissCompletion(page);
	await page.getByRole('button', { name: 'Continue' }).click();
	await expect(page.getByText(/completed every available puzzle/)).toBeVisible();
	await snap(page, 'home-all-puzzles-done');
	expect(backend.db.userPuzzles).toHaveLength(2);
});

test('signed-in pages: history, history detail, leaderboard', async ({ page, backend }) => {
	await backend.signInAs(ADA);
	backend.db.userPuzzles.push({
		id: 'seeded-1',
		profile_id: ADA.sub,
		puzzle_id: WORD_SQUARE.id,
		used_check: 1,
		used_reveal: 0,
		used_clear: 0,
		time_in_seconds: 42,
		created_at: backend.db.now()
	});
	await timed('history: goto -> stats visible', async () => {
		await page.goto('/history');
		await expect(page.getByText("You've completed 1 puzzles!")).toBeVisible();
	});
	await snap(page, 'history');
	await page.getByRole('link', { name: /Puzzle on/ }).click();
	await expect(page.locator('#toolbar')).toContainText('Solved in 42s');
	await expect(page.locator('g.cell text.value')).toHaveCount(9);
	await snap(page, 'history-detail-revealed');
	await timed('leaderboard: goto -> list visible', async () => {
		await page.goto('/leaderboard');
		await expect(page.getByText('Total users: 1')).toBeVisible();
	});
	await snap(page, 'leaderboard');
});
