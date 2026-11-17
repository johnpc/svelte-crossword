import { expect } from '@playwright/test';
import { ADA } from '../fake-backend/install';
import { Given, Then, When } from '../fixtures';

Given('the user navigates to the login page', async ({ page }) => {
	await page.goto('/login');
	await expect(page.locator('#loginForm')).toBeVisible();
});

When('the user types their email into the email field', async ({ page }) => {
	await page.locator('#email').fill(ADA.email);
});

When('the user types {string} into the email field', async ({ page }, email: string) => {
	await page.locator('#email').fill(email);
});

When('the user types their password into the password field', async ({ page }) => {
	await page.locator('#password').fill(ADA.password);
});

When('the user submits the login form', async ({ page }) => {
	await page.locator('#loginForm button[type="submit"]').click();
});

Then('the user should see a personalized greeting on the home page', async ({ page }) => {
	await expect(page).toHaveURL(/\/$/);
	await expect(page.getByText(`👋 ${ADA.email.split('@')[0]}`)).toBeVisible();
});

Then('an alert containing {string} is shown', async ({ dialogs }, text: string) => {
	await expect.poll(() => dialogs.find((m) => m.includes(text))).toBeTruthy();
});
