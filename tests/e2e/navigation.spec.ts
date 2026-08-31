import { test, expect } from '@playwright/test';

test.describe('Navigation & Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-NAV-01: App loads with correct title and header', async ({ page }) => {
    await expect(page.locator('text=Luna\'s Pet Central')).toBeVisible();
    await expect(page.locator('text=Operator Jane')).toBeVisible();
    await expect(page.locator('text=OFFLINE')).toBeVisible();
  });

  test('TC-NAV-02: Displays active shelter name in header', async ({ page }) => {
    await expect(page.locator('text=Downtown Animal Haven')).toBeVisible();
  });

  test('TC-NAV-03: Bottom navigation shows all 5 tabs with correct labels', async ({ page }) => {
    const navLabels = ['Pets', 'Care', 'Stock', 'Tasks', 'System'];
    for (const label of navLabels) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }
  });

  test('TC-NAV-04: Pets tab is active by default on load', async ({ page }) => {
    await expect(page.locator('text=Active Shelter Pets')).toBeVisible();
    await expect(page.locator('text=Buddy')).toBeVisible();
    await expect(page.locator('text=Mochi')).toBeVisible();
  });

  test('TC-NAV-05: Navigating to Care tab shows care events', async ({ page }) => {
    await page.getByText('Care').click();
    await expect(page.locator('text=Scheduled Care Events')).toBeVisible();
    await expect(page.locator('text=Rabies Booster')).toBeVisible();
    await expect(page.locator('text=Pyrantel Pamoate')).toBeVisible();
  });

  test('TC-NAV-06: Navigating to Stock tab shows inventory', async ({ page }) => {
    await page.getByText('Stock').click();
    await expect(page.locator('text=Categorized Inventory')).toBeVisible();
    await expect(page.locator('text=Puppy Dry Food')).toBeVisible();
    await expect(page.locator('text=Rabies Vaccine Vials')).toBeVisible();
  });

  test('TC-NAV-07: Navigating to Tasks tab shows maintenance tasks', async ({ page }) => {
    await page.getByText('Tasks').click();
    await expect(page.locator('text=Facility Maintenance Tasks')).toBeVisible();
    await expect(page.locator('text=Kennel 3 door latch replacement')).toBeVisible();
    await expect(page.locator('text=Isolation ward deep disinfection')).toBeVisible();
  });

  test('TC-NAV-08: Navigating to System tab shows export and GDPR options', async ({ page }) => {
    await page.getByText('System').click();
    await expect(page.locator('text=Local Data Privacy & Export')).toBeVisible();
    await expect(page.locator('text=Export All Records')).toBeVisible();
    await expect(page.locator('text=GDPR Right-to-Erasure')).toBeVisible();
  });

  test('TC-NAV-09: Switching tabs updates active tab indicator', async ({ page }) => {
    await page.getByText('Care').click();
    await expect(page.locator('text=Care')).toHaveClass(/nav-active/i);

    await page.getByText('Pets').click();
    await expect(page.locator('text=Pets')).toHaveClass(/nav-active/i);
  });

  test('TC-SHELTER-01: Shelter selector opens modal on click', async ({ page }) => {
    await page.getByText('Downtown Animal Haven').click();
    await expect(page.locator('text=Switch Shelter Context')).toBeVisible();
  });

  test('TC-SHELTER-02: Shelter modal shows both shelter options', async ({ page }) => {
    await page.getByText('Downtown Animal Haven').click();
    await expect(page.locator('text=Downtown Animal Haven (Active)')).toBeVisible();
    await expect(page.locator('text=North Valley Rescue Branch')).toBeVisible();
  });

  test('TC-SHELTER-03: Switching shelter updates header display', async ({ page }) => {
    await page.getByText('Downtown Animal Haven').click();
    await page.getByText('North Valley Rescue Branch').click();
    await expect(page.locator('text=North Valley Rescue Branch')).toBeVisible();
  });

  test('TC-SHELTER-04: Closing shelter modal dismisses it', async ({ page }) => {
    await page.getByText('Downtown Animal Haven').click();
    await expect(page.locator('text=Switch Shelter Context')).toBeVisible();
    await page.getByText('Close').click();
    await expect(page.locator('text=Switch Shelter Context')).not.toBeVisible();
  });
});
