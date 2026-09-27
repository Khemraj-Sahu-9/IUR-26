import { test, expect } from '@playwright/test';

test.describe('ASHA Saathi - Phase 1 Foundation, Auth & Role Routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render the login screen with mobile-first elements and demo personas', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ASHA Saathi/i })).toBeVisible();
    await expect(page.getByText(/Community Healthcare Field Companion/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sunita Devi/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dr\. Anita Roy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Rajesh Sharma/i })).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
  });

  test('should display validation error for empty or invalid manual login', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /Sign In to ASHA Saathi/i });
    await signInButton.click();
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();

    await page.getByLabel(/Email Address/i).fill('invalid-email');
    await signInButton.click();
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
  });

  test('should authenticate ASHA demo persona and route to ASHA Field Dashboard', async ({ page }) => {
    // 1-Tap ASHA demo persona login
    const ashaDemoBtn = page.getByRole('button', { name: /Sunita Devi/i });
    await ashaDemoBtn.click();

    // Verify redirection to ASHA shell
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Assigned Ward:/i)).toBeVisible();
    await expect(page.getByText(/Daily Action Areas/i)).toBeVisible();

    // Verify presence of core action areas
    await expect(page.getByRole('button', { name: /Households/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Patients/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Visits/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Drug Kit/i }).first()).toBeVisible();

    // Verify logout
    const logoutBtn = page.getByLabel('Logout');
    await logoutBtn.click();
    await expect(page.getByRole('heading', { name: /ASHA Saathi/i })).toBeVisible();
  });

  test('should authenticate Supervisor demo persona and route to Supervisor Portal', async ({ page }) => {
    const supervisorDemoBtn = page.getByRole('button', { name: /Dr\. Anita Roy/i });
    await supervisorDemoBtn.click();

    await expect(page.getByText(/Supervisor Portal/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Supervisory Governance/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Medicines/i })).toBeVisible();

    // Logout
    await page.getByLabel('Logout').click();
  });

  test('should authenticate Manager demo persona and route to Manager Console', async ({ page }) => {
    const managerDemoBtn = page.getByRole('button', { name: /Rajesh Sharma/i });
    await managerDemoBtn.click();

    await expect(page.getByText('PHC Administration Portal')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('PHC Administration • पीएचसी प्रबंधन')).toBeVisible();
    await expect(page.getByRole('button', { name: /Manage Stock/i })).toBeVisible();

    // Logout
    await page.getByLabel('Logout').click();
  });

  test('should enforce role isolation - ASHA cannot see PHC Administration', async ({ page }) => {
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });

    // Ensure manager-specific inventory view is NOT rendered
    await expect(page.getByText('PHC Administration Portal')).not.toBeVisible();
    await expect(page.getByText(/PHC Central Stock Inventory/i)).not.toBeVisible();
  });
});
