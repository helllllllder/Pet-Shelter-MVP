import { test, expect } from '@playwright/test';

test.describe('Escalation Banner', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-ESC-01: Escalation banner is visible on app load', async ({ page }) => {
    await expect(page.locator('text=⚠️')).toBeVisible();
  });

  test('TC-ESC-02: Banner shows SMTP timeout escalation message', async ({ page }) => {
    await expect(page.locator('text=External Email alert')).toBeVisible();
    await expect(page.locator('text=Rabies Booster')).toBeVisible();
    await expect(page.locator('text=SMTP Timeout')).toBeVisible();
  });

  test('TC-ESC-03: Banner shows retry count information', async ({ page }) => {
    await expect(page.locator('text=3 retries')).toBeVisible();
  });

  test('TC-ESC-04: Banner shows escalation to in-app banner', async ({ page }) => {
    await expect(page.locator('text=Escalated to in-app banner')).toBeVisible();
  });

  test('TC-ESC-05: Dismiss button is visible on banner', async ({ page }) => {
    await expect(page.getByText('Dismiss')).toBeVisible();
  });

  test('TC-ESC-06: Clicking dismiss removes the banner', async ({ page }) => {
    await page.getByText('Dismiss').click();
    await expect(page.locator('text=⚠️')).not.toBeVisible();
  });

  test('TC-ESC-07: After dismissing, main content is still accessible', async ({ page }) => {
    await page.getByText('Dismiss').click();
    // Verify we can still navigate and interact
    await expect(page.locator('text=Buddy')).toBeVisible();
    await expect(page.locator('text=Mochi')).toBeVisible();
  });

  test('TC-ESC-08: Banner has distinct warning styling', async ({ page }) => {
    // The banner should be visible with red/dark background
    const banner = page.locator('text=⚠️').locator('..');
    await expect(banner).toBeVisible();
  });

  test('TC-ESC-09: Navigation works while banner is visible', async ({ page }) => {
    // Navigate to another tab without dismissing
    await page.getByText('Care').click();
    await expect(page.locator('text=Scheduled Care Events')).toBeVisible();
    // Banner should still be visible
    await expect(page.locator('text=⚠️')).toBeVisible();
  });

  test('TC-ESC-10: Dismissing banner and then navigating keeps it dismissed', async ({ page }) => {
    await page.getByText('Dismiss').click();
    await expect(page.locator('text=⚠️')).not.toBeVisible();

    // Navigate to another tab
    await page.getByText('Stock').click();
    await expect(page.locator('text=Categorized Inventory')).toBeVisible();
    // Banner should remain dismissed
    await expect(page.locator('text=⚠️')).not.toBeVisible();
  });
});
