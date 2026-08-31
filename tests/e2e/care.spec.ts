import { test, expect } from '@playwright/test';

test.describe('Care Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByText('Care').click();
    // Wait for care content to render after tab switch
    await page.waitForSelector('text=Scheduled Care Events', { timeout: 10000 });
    // Extra wait for FlatList items to render
    await page.waitForTimeout(300);
  });

  test('TC-CARE-01: Shows scheduled care events heading', async ({ page }) => {
    await expect(page.getByText('Scheduled Care Events')).toBeVisible();
  });

  test('TC-CARE-02: Displays Buddy rabies vaccine care event', async ({ page }) => {
    // Use emoji prefix to disambiguate from escalation banner
    await expect(page.getByText('💉 Rabies Booster')).toBeVisible();
    await expect(page.getByText('Buddy')).toBeVisible();
  });

  test('TC-CARE-03: Displays Mochi deworming care event', async ({ page }) => {
    await expect(page.getByText('Pyrantel Pamoate')).toBeVisible();
    await expect(page.getByText('Mochi')).toBeVisible();
  });

  test('TC-CARE-04: Shows dosage information for care events', async ({ page }) => {
    await expect(page.getByText('1 vial (1ml)')).toBeVisible();
    await expect(page.getByText('0.5ml oral')).toBeVisible();
  });

  test('TC-CARE-05: Shows due date for care events', async ({ page }) => {
    await expect(page.getByText('Due: Today')).toBeVisible();
    await expect(page.getByText('Due: Tomorrow')).toBeVisible();
  });

  test('TC-CARE-06: Shows DUE TODAY badge for Buddy vaccine', async ({ page }) => {
    // The Rabies Booster event has isDueToday: true
    await expect(page.getByText('DUE TODAY')).toBeVisible();
  });

  test('TC-CARE-07: 1-Click Intake Pack button is visible', async ({ page }) => {
    await expect(page.getByText('⚡ 1-Click Intake Pack')).toBeVisible();
  });

  test('TC-CARE-08: Clicking 1-Click template decrements vaccine and syringe counts', async ({ page }) => {
    // Record initial quantities
    await expect(page.locator('text=8 DOSES')).toBeVisible();
    await expect(page.locator('text=98 UNITS')).toBeVisible();

    await page.getByText('⚡ 1-Click Intake Pack').click();
    await page.waitForTimeout(500);

    // RNW Alert.alert() is a no-op, but the handler should still execute
    // Verify quantities decreased by 1
    await expect(page.locator('text=7 DOSES')).toBeVisible();
    await expect(page.locator('text=97 UNITS')).toBeVisible();
  });

  test('TC-CARE-09: 1-Click template can be applied multiple times', async ({ page }) => {
    // Apply twice
    for (let i = 0; i < 2; i++) {
      await page.getByText('⚡ 1-Click Intake Pack').click();
      await page.waitForTimeout(300);
    }

    // Should have decremented by 2 from initial 8
    await expect(page.locator('text=6 DOSES')).toBeVisible();
    await expect(page.locator('text=96 UNITS')).toBeVisible();
  });

  test('TC-CARE-10: Mochi deworming does NOT show DUE TODAY badge', async ({ page }) => {
    const dueTodayBadges = page.locator('text=DUE TODAY');
    await expect(dueTodayBadges).toHaveCount(1);
  });

  test('TC-CARE-11: Care events show recurrence info', async ({ page }) => {
    await expect(page.getByText('Recurrence: Scheduled')).toBeVisible();
  });
});
