import { expect, test } from '@playwright/test';

test.describe('DinoRPG Remastered', () => {
	test('backend healthcheck is available', async ({ request }) => {
		const response = await request.get('http://127.0.0.1:8081/healthcheck');

		expect(response.ok()).toBe(true);

		expect(await response.json()).toEqual({
			status: 'OK'
		});
	});

	test('homepage is displayed', async ({ page }) => {
		await page.goto('/');

		await expect(page).toHaveURL('http://127.0.0.1:8080/');

		await expect(page.getByRole('img', { name: 'DinoRPG' })).toBeVisible();
	});

	test('public legal notices page is accessible', async ({ page }) => {
		await page.goto('/legal-notices');

		await expect(page).toHaveURL(/\/legal-notices$/);

		await expect(page.locator('#app')).toBeVisible();
	});
});
