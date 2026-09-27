import { test, expect } from '@playwright/test';

test.describe('ASHA Saathi - Phase 3 Home Visits, Follow-ups & Referrals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Log in as ASHA demo persona (Sunita Devi)
    const ashaDemoBtn = page.getByRole('button', { name: /Sunita Devi/i });
    await ashaDemoBtn.click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to Daily Tasks and view filter tabs', async ({ page }) => {
    // Navigate via bottom nav or dashboard
    const tasksTab = page.getByRole('button', { name: 'Tasks', exact: true });
    if (await tasksTab.isVisible()) {
      await tasksTab.click();
    } else {
      await page.getByRole('button', { name: /Visits & Tasks/i }).first().click();
    }

    await expect(page.getByText(/Field Tasks & Reminders/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Today/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Upcoming/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Overdue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Completed/i })).toBeVisible();
  });

  test('should open a patient profile and display Phase 3 action buttons and clinical sections', async ({ page }) => {
    // Navigate to patients list
    await page.getByRole('button', { name: /Patients/i }).first().click();
    await expect(page.getByRole('heading', { name: /Patients/i })).toBeVisible({ timeout: 10000 });

    // Look for first available patient card or register one
    const patientCards = page.locator('div[role="button"]');
    const count = await patientCards.count();

    if (count > 0) {
      await patientCards.first().click();

      // Check for primary Phase 3 buttons
      await expect(page.getByRole('button', { name: /Record Visit/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Refer Patient/i })).toBeVisible();

      // Check for clinical sections
      await expect(page.getByText(/Visit History|भ्रमण इतिहास/i)).toBeVisible();
      await expect(page.getByText(/Follow-ups|फॉलो-अप/i)).toBeVisible();
      await expect(page.getByText(/Referrals|रेफरल विवरण/i)).toBeVisible();
    }
  });

  test('should render the Record Visit form with all fields and validations', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).first().click();
    const patientCards = page.locator('div[role="button"]');

    if ((await patientCards.count()) > 0) {
      await patientCards.first().click();
      await page.getByRole('button', { name: /Record Visit/i }).click();

      // Form header and fields
      await expect(page.getByText(/Record Home Visit/i)).toBeVisible();
      await expect(page.getByText(/Visit Date/i)).toBeVisible();
      await expect(page.getByText(/Visit Type/i)).toBeVisible();
      await expect(page.getByText(/Clinical Notes/i)).toBeVisible();
      await expect(page.getByText(/Follow-up required/i)).toBeVisible();

      // Toggle follow-up fields
      const followUpCheckbox = page.getByRole('checkbox');
      await followUpCheckbox.check();
      await expect(page.getByText(/Next Follow-up Date/i)).toBeVisible();

      // Cancel back to profile
      await page.getByRole('button', { name: /Cancel|रद्द करें/i }).click();
      await expect(page.getByRole('button', { name: /Record Visit/i })).toBeVisible();
    }
  });

  test('should render the Refer Patient form with facility selector', async ({ page }) => {
    await page.getByRole('button', { name: /Patients/i }).first().click();
    const patientCards = page.locator('div[role="button"]');

    if ((await patientCards.count()) > 0) {
      await patientCards.first().click();
      await page.getByRole('button', { name: /Refer Patient/i }).click();

      // Form header and fields
      await expect(page.getByText(/Refer Patient • मरीज रेफर करें/i)).toBeVisible();
      await expect(page.getByText(/Referred To Facility/i)).toBeVisible();
      await expect(page.getByText(/Reason for Referral/i)).toBeVisible();

      // Cancel back to profile
      await page.getByRole('button', { name: /Cancel|रद्द करें/i }).click();
      await expect(page.getByRole('button', { name: /Refer Patient/i })).toBeVisible();
    }
  });
});
