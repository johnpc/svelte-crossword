import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const requireCreds = (): { username: string; password: string } => {
	const username = process.env.TEST_USERNAME;
	const password = process.env.TEST_PASSWORD;
	if (!username || !password) {
		throw new Error('TEST_USERNAME and TEST_PASSWORD must be set to run the login e2e tests.');
	}
	return { username, password };
};

Given('the user navigates to the login page', async ({ page }) => {
	requireCreds();
	await page.goto('/login');
	await expect(page.locator('#loginForm')).toBeVisible();
});

When('the user types their email into the email field', async ({ page }) => {
	const { username } = requireCreds();
	await page.locator('#email').fill(username);
});

When('the user types their password into the password field', async ({ page }) => {
	const { password } = requireCreds();
	await page.locator('#password').fill(password);
});

When('the user submits the login form', async ({ page }) => {
	await page.locator('#loginForm button[type="submit"]').click();
});

Then('the user should see a personalized greeting on the home page', async ({ page }) => {
	const { username } = requireCreds();
	const localPart = username.split('@')[0];
	await expect(page).toHaveURL(/\/$|\/index/, { timeout: 30000 });
	await expect(page.locator(`text=👋 ${localPart}`)).toBeVisible({ timeout: 30000 });
});
