import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('the user clicks the first cell of the puzzle', async ({ page }) => {
	const firstCell = page.locator('g.cell-0-0').first();
	await expect(firstCell).toBeVisible({ timeout: 10000 });
	await firstCell.click();
});

When('the user types {string}', async ({ page }, text: string) => {
	for (const char of text) {
		await page.keyboard.press(char);
	}
});

Then('the puzzle should show the completion message', async ({ page }) => {
	await expect(page.locator('.completed')).toBeVisible({ timeout: 10000 });
	await expect(page.locator('.completed .message')).toContainText('solved');
});
