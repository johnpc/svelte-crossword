import { expect } from '@playwright/test';
import { ADA } from '../fake-backend/install';
import { FIXTURE_PUZZLES } from '../fake-backend/puzzles';
import { Given, Then, When } from '../fixtures';

const puzzleByTitle = (title: string) => {
	const puzzle = FIXTURE_PUZZLES.find((p) => p.title === title);
	if (!puzzle) throw new Error(`No fixture puzzle titled "${title}"`);
	return puzzle;
};
const completionsOfAda = (rows: { profile_id: string }[]) =>
	rows.filter((r) => r.profile_id === ADA.sub);
const toolbar = (page: import('@playwright/test').Page) => page.locator('.toolbar');

Given('the user is signed in as the fixture account', async ({ backend }) => {
	await backend.signInAs(ADA);
});

Given(
	'the fixture account has completed {string} in {int} seconds',
	async ({ backend }, title: string, seconds: number) => {
		backend.db.userPuzzles.push({
			id: `seeded-${puzzleByTitle(title).id}`,
			profile_id: ADA.sub,
			puzzle_id: puzzleByTitle(title).id,
			used_check: 0,
			used_reveal: 0,
			used_clear: 0,
			time_in_seconds: seconds,
			created_at: backend.db.now()
		});
	}
);

Then(
	'the puzzle {string} by {string} is shown',
	async ({ page }, title: string, author: string) => {
		await expect(page.locator('.puzzle-title')).toHaveText(title);
		await expect(page.locator('.puzzle-author')).toHaveText(`by ${author}`);
		await expect(page.locator('article.svelte-crossword section.puzzle svg')).toBeVisible();
	}
);

Then('the greeting shows {string}', async ({ page }, name: string) => {
	await expect(page.getByText(`👋 ${name}`)).toBeVisible();
});

Then('the timer advances past zero', async ({ page }) => {
	await expect(page.locator('#timer')).toHaveText(/[1-9]\d*s/);
});

When('the user types the solution of {string}', async ({ page }, title: string) => {
	for (const char of puzzleByTitle(title).typing) await page.keyboard.press(char);
});

When('the user clicks the {string} toolbar button', async ({ page }, name: string) => {
	await toolbar(page).getByRole('button', { name }).click();
});

When('the user clicks Continue', async ({ page }) => {
	await toolbar(page).getByRole('button', { name: 'Continue' }).click();
});

Then('the first cell is marked incorrect', async ({ page }) => {
	await expect(page.locator('g.cell-0-0')).toHaveClass(/is-incorrect/);
});

Then('the first cell is not marked incorrect', async ({ page }) => {
	await expect(page.locator('g.cell-0-0')).not.toHaveClass(/is-incorrect/);
});

Then('the {string} toolbar button is highlighted as used', async ({ page }, name: string) => {
	await expect(toolbar(page).getByRole('button', { name })).toHaveClass(/active/);
});

Then(
	'the backend has recorded {int} completion(s) for the fixture account',
	async ({ backend }, count: number) => {
		await expect.poll(() => completionsOfAda(backend.db.userPuzzles).length).toBe(count);
	}
);

Then(
	'the backend has recorded {int} completion(s) for the fixture account with reveal used',
	async ({ backend }, count: number) => {
		await expect
			.poll(
				() => completionsOfAda(backend.db.userPuzzles).filter((r) => r.used_reveal === 1).length
			)
			.toBe(count);
	}
);

Then('the all-done notice is shown', async ({ page }) => {
	await expect(page.getByText(/completed every available puzzle/)).toBeVisible();
});

Then('the history page lists {int} completed puzzle(s)', async ({ page }, count: number) => {
	await expect(page).toHaveURL(/\/history/);
	await expect(page.getByText(`You've completed ${count} puzzles!`)).toBeVisible();
});

Then('the leaderboard lists {string}', async ({ page }, entry: string) => {
	await expect(page.locator('ol > li', { hasText: entry })).toBeVisible();
});

Then('the leaderboard shows {string}', async ({ page }, text: string) => {
	await expect(page.getByText(text)).toBeVisible();
});
