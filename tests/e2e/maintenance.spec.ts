import { test, expect } from '@playwright/test';

test.describe('Maintenance Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByText('Tasks').click();
    await page.waitForTimeout(300);
  });

  test('TC-MAINT-01: Shows facility maintenance heading', async ({ page }) => {
    await expect(page.locator('text=Facility Maintenance Tasks')).toBeVisible();
  });

  test('TC-MAINT-02: Displays repair task with correct type badge', async ({ page }) => {
    await expect(page.locator('text=🛠️ REPAIR')).toBeVisible();
    await expect(page.locator('text=Kennel 3 door latch replacement')).toBeVisible();
  });

  test('TC-MAINT-03: Displays cleaning task with correct type badge', async ({ page }) => {
    await expect(page.locator('text=🛠️ CLEANING')).toBeVisible();
    await expect(page.locator('text=Isolation ward deep disinfection')).toBeVisible();
  });

  test('TC-MAINT-04: Shows scheduled date for tasks', async ({ page }) => {
    await expect(page.locator('text=Scheduled: 2026-09-01')).toBeVisible();
    await expect(page.locator('text=Scheduled: Today')).toBeVisible();
  });

  test('TC-MAINT-05: Shows SCHEDULED status badge for pending tasks', async ({ page }) => {
    const scheduledBadges = page.locator('text=SCHEDULED');
    await expect(scheduledBadges).toHaveCount(2);
  });

  test('TC-MAINT-06: Mark Completed button is visible for scheduled tasks', async ({ page }) => {
    await expect(page.locator('text=✓ Mark Completed')).toHaveCount(2);
  });

  test('TC-MAINT-07: Completing a task changes its status to COMPLETED', async ({ page }) => {
    await page.getByText('✓ Mark Completed').first().click();
    await page.waitForTimeout(300);

    // First task should now show COMPLETED
    await expect(page.locator('text=COMPLETED')).toBeVisible();
    // Only one SCHEDULED badge should remain
    const scheduledBadges = page.locator('text=SCHEDULED');
    await expect(scheduledBadges).toHaveCount(1);
  });

  test('TC-MAINT-08: Completed tasks no longer show Mark Completed button', async ({ page }) => {
    await page.getByText('✓ Mark Completed').first().click();
    await page.waitForTimeout(300);

    // Only the remaining scheduled task should have the button
    const completeButtons = page.locator('text=✓ Mark Completed');
    await expect(completeButtons).toHaveCount(1);
  });

  test('TC-MAINT-09: Completing all tasks removes all Mark Completed buttons', async ({ page }) => {
    // Complete first task
    await page.getByText('✓ Mark Completed').first().click();
    await page.waitForTimeout(300);

    // Complete second task
    await page.getByText('✓ Mark Completed').first().click();
    await page.waitForTimeout(300);

    // No more Mark Completed buttons should exist
    const completeButtons = page.locator('text=✓ Mark Completed');
    await expect(completeButtons).toHaveCount(0);
  });

  test('TC-MAINT-10: All tasks show COMPLETED status after completion', async ({ page }) => {
    // Complete both tasks
    await page.getByText('✓ Mark Completed').first().click();
    await page.waitForTimeout(300);

    await page.getByText('✓ Mark Completed').first().click();
    await page.waitForTimeout(300);

    const completedBadges = page.locator('text=COMPLETED');
    await expect(completedBadges).toHaveCount(2);
  });

  test('TC-MAINT-11: Mark Completed button is a clickable element', async ({ page }) => {
    // Verify the button exists and can be clicked
    const btn = page.getByText('✓ Mark Completed').first();
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('TC-MAINT-12: Task cards show description text', async ({ page }) => {
    await expect(page.locator('text=Kennel 3 door latch replacement')).toBeVisible();
    await expect(page.locator('text=Isolation ward deep disinfection')).toBeVisible();
  });
});
