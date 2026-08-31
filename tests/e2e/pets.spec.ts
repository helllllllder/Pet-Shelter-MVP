import { test, expect } from '@playwright/test';

test.describe('Pets Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Ensure we're on the pets tab
    await page.getByText('Pets').click();
    await page.waitForTimeout(300);
  });

  test('TC-PETS-01: Displays initial pet list with 2 pets', async ({ page }) => {
    await expect(page.locator('text=Buddy')).toBeVisible();
    await expect(page.locator('text=Mochi')).toBeVisible();
  });

  test('TC-PETS-02: Shows correct species icons for each pet', async ({ page }) => {
    // Buddy is CANINE (dog emoji)
    await expect(page.getByText('🐶 Buddy')).toBeVisible();
    // Mochi is FELINE (cat emoji)
    await expect(page.getByText('🐱 Mochi')).toBeVisible();
  });

  test('TC-PETS-03: Shows pet breed and birth date', async ({ page }) => {
    await expect(page.locator('text=Golden Retriever Mix')).toBeVisible();
    await expect(page.locator('text=Born: 2023-04-15')).toBeVisible();
    await expect(page.locator('text=Domestic Shorthair')).toBeVisible();
    await expect(page.locator('text=Born: 2024-01-10')).toBeVisible();
  });

  test('TC-PETS-04: Shows estimated DOB indicator for Mochi', async ({ page }) => {
    // Mochi has isDobEstimated: true
    await expect(page.locator('text=(Est.)')).toBeVisible();
  });

  test('TC-PETS-05: Shows intake origin and health status', async ({ page }) => {
    await expect(page.locator('text=Intake: STRAY')).toBeVisible();
    await expect(page.locator('text=Health: HEALTHY')).toBeVisible();
  });

  test('TC-PETS-06: Shows ADOPTABLE badge for available pets', async ({ page }) => {
    await expect(page.locator('text=ADOPTABLE')).toBeVisible();
  });

  test('TC-PETS-07: Shows "Process Adoption" button for available pets', async ({ page }) => {
    await expect(page.locator('text=Process Adoption')).toBeVisible();
  });

  test('TC-PETS-08: Add Pet button opens modal', async ({ page }) => {
    await page.getByText('+ Add Pet').click();
    await expect(page.locator('text=Add New Pet Intake')).toBeVisible();
  });

  test('TC-PETS-09: Add Pet modal has name and breed input fields', async ({ page }) => {
    await page.getByText('+ Add Pet').click();
    await expect(page.locator('placeholder="Pet Name (e.g. Luna)"')).toBeVisible();
    await expect(page.locator('placeholder="Breed (e.g. Labrador Retriever)"')).toBeVisible();
  });

  test('TC-PETS-10: Adding a pet creates it in the list', async ({ page }) => {
    await page.getByText('+ Add Pet').click();
    await page.locator('placeholder="Pet Name (e.g. Luna)"').fill('Luna');
    await page.locator('placeholder="Breed (e.g. Labrador Retriever)"').fill('Husky Mix');
    await page.getByText('Save Intake').click();
    await expect(page.locator('text=Luna')).toBeVisible();
  });

  test('TC-PETS-11: Adding a pet increases the pet count', async ({ page }) => {
    // Initially 2 pets
    await expect(page.locator('text=Active Shelter Pets \\(2\\)')).toBeVisible();

    await page.getByText('+ Add Pet').click();
    await page.locator('placeholder="Pet Name (e.g. Luna)"').fill('Luna');
    await page.getByText('Save Intake').click();
    await page.waitForTimeout(300);

    // Now 3 pets
    await expect(page.locator('text=Active Shelter Pets \\(3\\)')).toBeVisible();
  });

  test('TC-PETS-12: Cancel button closes add pet modal without saving', async ({ page }) => {
    await page.getByText('+ Add Pet').click();
    await page.locator('placeholder="Pet Name (e.g. Luna)"').fill('Should Not Appear');
    await page.getByText('Cancel').click();
    // Modal should be closed
    await expect(page.locator('text=Add New Pet Intake')).not.toBeVisible();
  });

  test('TC-PETS-13: Save Intake button is present in add pet modal', async ({ page }) => {
    await page.getByText('+ Add Pet').click();
    await expect(page.getByText('Save Intake')).toBeVisible();
  });

  test('TC-PETS-14: Cancel button is present in add pet modal', async ({ page }) => {
    await page.getByText('+ Add Pet').click();
    await expect(page.getByText('Cancel')).toBeVisible();
  });

  test('TC-PETS-15: Process adoption opens modal with pet name', async ({ page }) => {
    await page.getByText('Process Adoption').first().click();
    await expect(page.locator('text=Process Adoption for Buddy')).toBeVisible();
  });

  test('TC-PETS-16: Adoption modal has adopter name, phone, and address fields', async ({ page }) => {
    await page.getByText('Process Adoption').first().click();
    await expect(page.locator('placeholder="Adopter Full Legal Name"')).toBeVisible();
    await expect(page.locator('placeholder="Adopter Phone Number"')).toBeVisible();
    await expect(page.locator('placeholder="Residential Address"')).toBeVisible();
  });

  test('TC-PETS-17: Finalize adoption marks pet as adopted', async ({ page }) => {
    await page.getByText('Process Adoption').first().click();
    await page.locator('placeholder="Adopter Full Legal Name"').fill('John Smith');
    await page.locator('placeholder="Adopter Phone Number"').fill('555-1234');
    await page.getByText('Finalize Adoption').click();
    await page.waitForTimeout(300);

    // Buddy should now show ADOPTED badge instead of ADOPTABLE
    const buddyCard = page.locator('text=🐶 Buddy').locator('..').locator('..');
    await expect(buddyCard.locator('text=ADOPTED')).toBeVisible();
    // Process Adoption button should no longer be visible for Buddy
    await expect(buddyCard.locator('text=Process Adoption')).not.toBeVisible();
  });

  test('TC-PETS-18: Cancel adoption modal closes without saving', async ({ page }) => {
    await page.getByText('Process Adoption').first().click();
    await page.getByText('Cancel').click();
    await expect(page.locator('text=Process Adoption for')).not.toBeVisible();
  });

  test('TC-PETS-19: Finalize Adoption button is present in adoption modal', async ({ page }) => {
    await page.getByText('Process Adoption').first().click();
    await expect(page.getByText('Finalize Adoption')).toBeVisible();
  });

  test('TC-PETS-20: Cancel button is present in adoption modal', async ({ page }) => {
    await page.getByText('Process Adoption').first().click();
    await expect(page.getByText('Cancel')).toBeVisible();
  });

  test('TC-PETS-21: Pet count in header reflects available pets', async ({ page }) => {
    // Both initial pets are available for adoption
    await expect(page.locator('text=Active Shelter Pets \\(2\\)')).toBeVisible();
  });

  test('TC-PETS-22: Adopting a pet decreases the available count', async ({ page }) => {
    await expect(page.locator('text=Active Shelter Pets \\(2\\)')).toBeVisible();

    await page.getByText('Process Adoption').first().click();
    await page.locator('placeholder="Adopter Full Legal Name"').fill('Jane Doe');
    await page.locator('placeholder="Adopter Phone Number"').fill('555-9999');
    await page.getByText('Finalize Adoption').click();
    await page.waitForTimeout(300);

    // Only 1 pet should now be available
    await expect(page.locator('text=Active Shelter Pets \\(1\\)')).toBeVisible();
  });
});
