import { test, expect } from '@playwright/test';

test.describe('Signin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss the PWA install prompt
    await page.addInitScript(() => {
      window.localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    });
  });

  test('should login a user and redirect to dashboard', async ({ page }) => {



    const testEmail = `test@gmail.com`;
    const testPassword = 'password';


    await page.goto('/signin');


    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);

    await page.click('button:has-text("Sign In")');

    await expect(page).toHaveURL(/.*dashboard/);

    // await expect(page.locator('div.relative.w-screen.h-screen')).toBeVisible();
  });
});
