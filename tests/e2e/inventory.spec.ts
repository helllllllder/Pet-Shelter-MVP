import { test, expect } from '@playwright/test';

test.describe('Inventory Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByText('Stock').click();
  });

  test('TC-INV-01: Shows categorized inventory heading', async ({ page }) => {
    await expect(page.locator('text=Categorized Inventory')).toBeVisible();
  });

  test('TC-INV-02: Displays all 4 inventory items', async ({ page }) => {
    await expect(page.locator('text=Puppy Dry Food')).toBeVisible();
    await expect(page.locator('text=Rabies Vaccine Vials')).toBeVisible();
    await expect(page.locator('text=Kennel Disinfectant')).toBeVisible();
    await expect(page.locator('text=3ml Syringes')).toBeVisible();
  });

  test('TC-INV-03: Shows correct categories for each item', async ({ page }) => {
    await expect(page.locator('text=Category: FOOD')).toBeVisible();
    await expect(page.locator('text=Category: MEDICATION')).toBeVisible();
    await expect(page.locator('text=Category: CLEANING_SUPPLIES')).toBeVisible();
    await expect(page.locator('text=Category: EQUIPMENT')).toBeVisible();
  });

  test('TC-INV-04: Shows correct quantities for each item', async ({ page }) => {
    await expect(page.locator('text=45 KG')).toBeVisible();
    await expect(page.locator('text=8 DOSES')).toBeVisible();
    await expect(page.locator('text=24 L')).toBeVisible();
    await expect(page.locator('text=98 UNITS')).toBeVisible();
  });

  test('TC-INV-05: Shows alert threshold information', async ({ page }) => {
    await expect(page.locator('text=Alert Threshold: 15 KG')).toBeVisible();
    await expect(page.locator('text=Alert Threshold: 10 DOSES')).toBeVisible();
  });

  test('TC-INV-06: Vaccine vials show LOW STOCK badge (8 <= threshold 10)', async ({ page }) => {
    await expect(page.locator('text=LOW STOCK')).toBeVisible();
  });

  test('TC-INV-07: Decreasing quantity with minus button works', async ({ page }) => {
    // Find the Puppy Dry Food card and click its minus button
    const puppyCard = page.locator('text=Puppy Dry Food').locator('..').locator('..');
    await puppyCard.getByText('-').click();
    await expect(page.locator('text=44 KG')).toBeVisible();
  });

  test('TC-INV-08: Increasing quantity with plus button works', async ({ page }) => {
    const puppyCard = page.locator('text=Puppy Dry Food').locator('..').locator('..');
    await puppyCard.getByText('+').click();
    await expect(page.locator('text=46 KG')).toBeVisible();
  });

  test('TC-INV-09: Quantity does not go below zero', async ({ page }) => {
    // Find the item with lowest quantity (Rabies Vaccine Vials at 8)
    const vaccineCard = page.locator('text=Rabies Vaccine Vials').locator('..').locator('..');
    // Click minus 8 times to reach 0
    for (let i = 0; i < 9; i++) {
      await vaccineCard.getByText('-').click();
    }
    await expect(page.locator('text=0 DOSES')).toBeVisible();
  });

  test('TC-INV-10: Decreasing low stock item triggers LOW STOCK badge persist', async ({ page }) => {
    const vaccineCard = page.locator('text=Rabies Vaccine Vials').locator('..').locator('..');
    await vaccineCard.getByText('-').click();
    await expect(page.locator('text=LOW STOCK')).toBeVisible();
  });

  test('TC-INV-11: All items have minus and plus adjustment buttons', async ({ page }) => {
    const minusButtons = page.locator('text=-');
    await expect(minusButtons).toHaveCount(4);
    const plusButtons = page.locator('text=+');
    await expect(plusButtons).toHaveCount(4);
  });

  test('TC-INV-12: Items not below threshold do NOT show LOW STOCK badge', async ({ page }) => {
    // Only Rabies Vaccine Vials (8 <= 10) should be LOW STOCK
    const lowStockBadges = page.locator('text=LOW STOCK');
    await expect(lowStockBadges).toHaveCount(1);
  });

  test('TC-INV-13: Unit of measure displays correctly for each category', async ({ page }) => {
    await expect(page.locator('text=KG')).toBeVisible();
    await expect(page.locator('text=DOSES')).toBeVisible();
    await expect(page.locator('text=L')).toBeVisible();
    await expect(page.locator('text=UNITS')).toBeVisible();
  });
});
