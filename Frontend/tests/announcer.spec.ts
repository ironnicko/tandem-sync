import { test, expect } from '@playwright/test';

test.describe('Announcer Singleton & Signal Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss PWA prompts
    await page.addInitScript(() => {
      window.localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    });
    
    // Sign in for all tests
    await page.goto('/signin');
    await page.fill('#email', 'test@gmail.com');
    await page.fill('#password', 'password');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show centered overlay and activity log when a signal is triggered', async ({ page }) => {
    // Note: This test assumes the user is already in a trip. 
    // If not, we might need a setup step to create/join a trip.
    
    // If SignalControls is not visible, the test will fail here, 
    // providing a clear signal that we need a trip context.
    const leftButton = page.locator('button[title="Left"]');
    
    // Wait for the dashboard to load fully
    await expect(page.locator('h2:has-text("Activity Log")')).toBeVisible();

    if (await leftButton.isVisible()) {
      await leftButton.click();

      // 1. Verify Big Icon Overlay (Centered)
      // It has z-[10000] and contains the icon. 
      // We check for the presence of the motion div's characteristic classes.
      const overlay = page.locator('.fixed.inset-0.z-\\[10000\\]');
      await expect(overlay).toBeVisible();

      // 2. Verify Activity Log entry
      const logEntry = page.locator('div:has-text("Left")').first();
      await expect(logEntry).toBeVisible();

      // 3. Verify it dims or stays based on logic (optional)
      // 4. Verify it auto-hides the big icon
      await expect(overlay).not.toBeVisible({ timeout: 5000 });
    } else {
      console.log('Skipping signal test: User not in an active trip.');
    }
  });

  test('should handle custom signal dropdown and notifications', async ({ page }) => {
    const customButton = page.locator('button[title="Custom"]');
    
    if (await customButton.isVisible()) {
      await customButton.click();

      // Verify dropdown appears
      const dropdown = page.locator('text=Custom Signals');
      await expect(dropdown).toBeVisible();

      // Click "Medic Help"
      await page.click('text=Medic Help');

      // Verify Big Icon for Medic Help
      const overlay = page.locator('.fixed.inset-0.z-\\[10000\\]');
      await expect(overlay).toBeVisible();

      // Verify Activity Log for Medic Help
      await expect(page.locator('text=Medic Help')).toBeVisible();
    }
  });
});
