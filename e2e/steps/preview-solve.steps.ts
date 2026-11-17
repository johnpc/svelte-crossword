import { expect } from '@playwright/test';
import { Then, When } from '../fixtures';

When('the user clicks the first cell of the puzzle', async ({ page }) => {
	await page.locator('g.cell-0-0').first().click();
	await expect(page.locator('g.cell-0-0').first()).toHaveClass(/is-focused/);
});

When('the user types {string}', async ({ page }, text: string) => {
	for (const char of text) await page.keyboard.press(char);
});

When('the user dismisses the completion message', async ({ page }) => {
	await page.getByRole('button', { name: 'View puzzle' }).click();
	await expect(page.locator('.completed')).toHaveCount(0);
});

Then('the puzzle should show the completion message', async ({ page }) => {
	await expect(page.locator('.completed .message')).toContainText('solved');
});

Then('the toolbar offers Continue instead of History', async ({ page }) => {
	await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'History' })).toHaveCount(0);
});

Then('the preview page is shown', async ({ page }) => {
	await expect(page).toHaveURL(/\/preview$/);
	await expect(page.getByText("You're not signed in!")).toBeVisible();
});

Then('every cell shows a letter', async ({ page }) => {
	// One atomic read per poll: both counts come from the same DOM snapshot, so
	// a grid that is still mounting can never satisfy it by accident.
	await expect
		.poll(() =>
			page.evaluate(() => {
				const cells = document.querySelectorAll('article.svelte-crossword g.cell').length;
				const letters = document.querySelectorAll(
					'article.svelte-crossword g.cell text.value'
				).length;
				return cells > 0 && cells === letters;
			})
		)
		.toBe(true);
});
