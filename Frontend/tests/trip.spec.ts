import { test, expect } from '@playwright/test';

test.describe('Trip Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss the PWA install prompt
    await page.addInitScript(() => {
      window.localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    });
  });

  test('should sign in and create a new trip successfully', async ({ page }) => {
    // 1. Unique account for clean state
    const uniqueId = Date.now();

    // SignIn Flow
    const testEmail = `test@gmail.com`;
    const testPassword = 'password';


    await page.goto('/signin');


    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);

    await page.click('button:has-text("Sign In")');

    // Expected redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 2. Trip Creation - Step 1: Locations
    const tripName = `Test Adventure ${uniqueId}`;
    await page.getByPlaceholder('Trip Name...').fill(tripName);

    // Fill Start Location and select from autocomplete
    await page.getByPlaceholder('Start...').fill('New York');
    // Wait for the dropdown and click the first result
    await page.waitForSelector('ul.absolute li');
    await page.locator('ul.absolute li').first().click();

    // Fill Destination and select from autocomplete
    await page.getByPlaceholder('Destination...').fill('Los Angeles');
    // Wait for the dropdown and click the first result
    await page.waitForSelector('ul.absolute li');
    await page.locator('ul.absolute li').first().click();

    // Move to next step
    await page.locator('#next-button').click();

    // 3. Trip Creation - Step 2: Settings
    await page.getByRole('spinbutton').fill('4'); // Max riders

    // Select Private (optional, for testing the radio)
    await page.getByLabel('Private').check();
    await page.getByLabel('Public').check(); // Back to public

    // Submit Trip creation
    await page.locator('#create-button').click();

    // 4. Verification
    // Success should redirect to /myRides
    await expect(page).toHaveURL(/.*myRides/);

    // Verify the trip exists in the list
    await expect(page.getByText(tripName)).toBeVisible();
  });
});
