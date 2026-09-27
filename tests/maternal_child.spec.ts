import { test, expect } from '@playwright/test';

test.describe('Phase 5 — Maternal & Child Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as ASHA demo persona (Sunita Devi)
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });
  });

  test('patients list view renders category filter chips', async ({ page }) => {
    // Navigate to Patients section
    await page.getByRole('button', { name: /Patients/i }).click();
    await expect(page.getByText(/individuals in assigned ward/i)).toBeVisible({ timeout: 10000 });

    // All six filter chips should be visible
    await expect(page.getByRole('button', { name: /All/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Pregnant/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Children/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Overdue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Female/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Male/i })).toBeVisible();
  });

  test('category filter chips are clickable and update active state', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).click();
    await expect(page.getByText(/individuals in assigned ward/i)).toBeVisible({ timeout: 10000 });

    // Click Pregnant filter chip
    const pregnantChip = page.getByRole('button', { name: /Pregnant/i });
    await pregnantChip.click();
    // Verify active styles applied (chip should have pink background)
    await expect(pregnantChip).toHaveClass(/bg-pink-600/);

    // Click Children filter chip
    const childrenChip = page.getByRole('button', { name: /Children/i });
    await childrenChip.click();
    await expect(childrenChip).toHaveClass(/bg-indigo-600/);

    // Return to All
    await page.getByRole('button', { name: /All/i }).first().click();
  });

  test('add visit form includes maternal_checkup and child_growth options', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).click();
    await expect(page.getByText(/individuals in assigned ward/i)).toBeVisible({ timeout: 10000 });

    // Open first patient if one exists
    const firstCard = page.locator('[data-testid="patient-card"]').first();
    const cardCount = await firstCard.count();

    if (cardCount === 0) {
      // No patients — just verify the add visit button is accessible from visits section
      await page.getByRole('button', { name: /Visits/i }).click();
      return;
    }

    await firstCard.click();
    await expect(page.getByText(/Patient Profile/i)).toBeVisible({ timeout: 8000 });

    // Click Add Visit
    const addVisitBtn = page.getByRole('button', { name: /Add Visit|Record Visit/i });
    if (await addVisitBtn.count() > 0) {
      await addVisitBtn.click();
      // Check visit type select includes new Phase 5 types
      const visitTypeSelect = page.locator('select').first();
      const options = visitTypeSelect.locator('option');
      const optionTexts = await options.allTextContents();
      expect(optionTexts.some((t) => t.toLowerCase().includes('maternal'))).toBeTruthy();
      expect(optionTexts.some((t) => t.toLowerCase().includes('child growth'))).toBeTruthy();
    }
  });

  test('patient profile shows maternal section for female patients', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).click();
    await expect(page.getByText(/individuals in assigned ward/i)).toBeVisible({ timeout: 10000 });

    // Click Female filter to narrow list
    await page.getByRole('button', { name: /Female/i }).click();
    const cards = page.locator('[data-testid="patient-card"]');
    if (await cards.count() === 0) return; // no female patients in seed data

    await cards.first().click();
    await expect(page.getByText(/Patient Profile/i)).toBeVisible({ timeout: 8000 });

    // For female patients, pregnancy / maternal section heading should appear
    await expect(
      page.getByText(/Pregnancy|Maternal|Active Pregnancy|No Active Pregnancy/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('supervisor sees Supervisory Governance and Medicines tab', async ({ page }) => {
    // Logout first
    await page.getByLabel('Logout').click();
    await expect(page.getByRole('heading', { name: /ASHA Saathi/i })).toBeVisible();

    // Login as supervisor
    await page.getByRole('button', { name: /Dr\. Anita Roy/i }).click();
    await expect(page.getByText(/Supervisor Portal/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Supervisory Governance/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Medicines/i })).toBeVisible();

    await page.getByLabel('Logout').click();
  });
});
