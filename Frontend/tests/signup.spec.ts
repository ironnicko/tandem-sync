import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss the PWA install prompt
    await page.addInitScript(() => {
      window.localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    });
  });

  test('should register a new user and redirect to dashboard', async ({ page }) => {

    const uniqueId = Date.now();
    const testName = `Test User ${uniqueId}`;
    const testEmail = `test-${uniqueId}@example.com`;
    const testPassword = 'Password123!';


    await page.goto('/signup');


    await page.fill('#name', testName);
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    await page.fill('#confirmPassword', testPassword);

    await page.click('button:has-text("Sign Up")');

    await expect(page).toHaveURL(/.*dashboard/);

    // await expect(page.locator('div.relative.w-screen.h-screen')).toBeVisible();
  });
});
