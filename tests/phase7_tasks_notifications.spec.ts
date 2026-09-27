import { test, expect } from '@playwright/test';

test.describe('ASHA Saathi - Phase 7 Tasks, Notifications & Supervisor/Manager Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ASHA worker can view Tasks & Follow-ups list with filter tabs and complete actions', async ({ page }) => {
    // 1. Login as ASHA
    const ashaDemoBtn = page.getByRole('button', { name: /Sunita Devi/i });
    await ashaDemoBtn.click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });

    // 2. Navigate to Tasks
    const tasksNavBtn = page.getByRole('button', { name: /Visits & Tasks/i });
    await tasksNavBtn.click();

    // 3. Verify Tasks & Follow-ups page headers and tabs
    await expect(page.getByRole('heading', { name: /Tasks & Follow-ups/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /^Today/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Upcoming/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Overdue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Done/i })).toBeVisible();

    // 4. Switch tabs
    await page.getByRole('button', { name: /^Upcoming/i }).click();
    await page.getByRole('button', { name: /^Overdue/i }).click();
    await page.getByRole('button', { name: /^Done/i }).click();
    await page.getByRole('button', { name: /^Today/i }).click();

    // 5. Navigate back to dashboard
    const backBtn = page.getByRole('button', { name: /Back/i }).or(page.getByLabel(/Back/i)).first();
    await backBtn.click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible();
  });

  test('ASHA worker can open Notification Center from dashboard bell icon', async ({ page }) => {
    // 1. Login as ASHA
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });

    // 2. Click Notification Bell
    const bellBtn = page.getByTitle('Notifications');
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // 3. Verify Notifications view loaded
    await expect(page.getByRole('heading', { name: /Notifications/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Unread:/i)).toBeVisible();

    // 4. Navigate back to dashboard
    const backBtn = page.getByRole('button', { name: /Back/i }).or(page.getByLabel(/Back/i)).first();
    await backBtn.click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible();
  });

  test('Supervisor Portal displays enhanced operational stats and monitoring tabs', async ({ page }) => {
    // 1. Login as Supervisor
    await page.getByRole('button', { name: /Dr\. Anita Roy/i }).click();
    await expect(page.getByText(/Supervisor Portal/i)).toBeVisible({ timeout: 15000 });

    // 2. Verify Overview stats cards
    await expect(page.getByText(/Active Sector ASHAs/i)).toBeVisible();
    await expect(page.getByText(/Visits This Week/i)).toBeVisible();
    await expect(page.getByText(/Pending Follow-ups/i)).toBeVisible();
    await expect(page.getByText(/Active Referrals/i)).toBeVisible();

    // 3. Check Monitoring Tab
    const monitoringBtn = page.getByRole('button', { name: /Activity & Monitoring/i });
    await expect(monitoringBtn).toBeVisible();
    await monitoringBtn.click();

    await expect(page.getByText(/Field Activity Monitoring/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Recent Home Visits/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Open Referrals/i })).toBeVisible();

    // 4. Return to Overview
    await page.getByRole('button', { name: /Overview/i }).first().click();
    await expect(page.getByText(/Supervisory Governance/i)).toBeVisible();
  });

  test('PHC Manager Portal displays inventory operational metrics and requisitions queue', async ({ page }) => {
    // 1. Login as Manager
    await page.getByRole('button', { name: /Rajesh Sharma/i }).click();
    await expect(page.getByText(/PHC Administration Portal/i)).toBeVisible({ timeout: 15000 });

    // 2. Verify Manager Overview cards
    await expect(page.getByText(/Pending Requests/i)).toBeVisible();
    await expect(page.getByText(/Low Stock Items/i)).toBeVisible();
    await expect(page.getByText(/Out of Stock/i)).toBeVisible();
    await expect(page.getByText(/Fulfilled This Week/i)).toBeVisible();

    // 3. Switch to Requisitions Queue tab
    const reqBtn = page.getByRole('button', { name: /Requisitions/i });
    await expect(reqBtn).toBeVisible();
    await reqBtn.click();

    await expect(page.getByText(/Drug Requisitions Queue/i)).toBeVisible({ timeout: 10000 });
  });
});
