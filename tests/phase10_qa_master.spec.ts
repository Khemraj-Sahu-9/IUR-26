import { test, expect } from '@playwright/test';

test.describe('Phase 10 QA — ASHA Master Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ASHA full navigation workflow', async ({ page }) => {
    // Login as ASHA (Sunita Devi)
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    
    // Verify Dashboard visible with 'ASHA Field Dashboard'
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).toBeVisible({ timeout: 15000 });
    
    // Navigate to Households via bottom nav
    await page.getByRole('button', { name: 'Households', exact: true }).click();
    
    // Verify Households list view renders
    await expect(page.getByRole('heading', { name: /Households/i }).first()).toBeVisible({ timeout: 10000 });
    
    // Navigate to Patients via bottom nav
    await page.getByRole('button', { name: 'Patients', exact: true }).click();
    
    // Verify Patients list renders with filter chips
    await expect(page.getByRole('heading', { name: /Patients/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /All/i }).first()).toBeVisible();
    
    // Navigate to Tasks via bottom nav  
    await page.getByRole('button', { name: 'Tasks', exact: true }).click();
    
    // Verify Tasks & Follow-ups view renders
    await expect(page.getByRole('heading', { name: /Tasks & Follow-ups/i }).first()).toBeVisible({ timeout: 10000 });
    
    // Navigate back to Home
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).toBeVisible({ timeout: 15000 });
    
    // Click medicines shortcut on dashboard
    await page.getByText(/Drug Kit|दवा किट/i).first().click();
    
    // Verify My Drug Kit view renders
    await expect(page.getByText(/Drug Kit|Medicines|दवा/i).first()).toBeVisible({ timeout: 10000 });
    
    // Navigate back to Home via bottom nav
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).toBeVisible({ timeout: 10000 });

    // Click notifications (bell icon with title="Notifications")
    await page.locator('button[title="Notifications"]').click();
    
    // Verify Notification Center renders
    await expect(page.getByText(/Notification Center|Notifications|सूचना/i).first()).toBeVisible({ timeout: 10000 });
    
    // Navigate back to Home via bottom nav
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).toBeVisible({ timeout: 10000 });

    // Click reports shortcut on dashboard
    await page.getByRole('button', { name: /View My Work Report/i }).click();
    
    // Verify ASHA Report view renders
    await expect(page.getByText(/Work Report|My Report|कार्य रिपोर्ट/i).first()).toBeVisible({ timeout: 10000 });
    
    // Navigate to Profile tab
    await page.getByRole('button', { name: 'Profile', exact: true }).click();
    
    // Verify Profile view renders
    await expect(page.getByText(/Profile|प्रोफ़ाइल/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Phase 10 QA — Supervisor Master Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Supervisor full navigation workflow', async ({ page }) => {
    // Login as Supervisor (Dr. Anita Roy)
    await page.getByRole('button', { name: /Dr\. Anita Roy/i }).click();
    
    // Verify Supervisor Portal visible
    await expect(page.getByText(/Supervisor Portal/i).first()).toBeVisible({ timeout: 15000 });
    
    // Verify Overview tab with stats cards
    await expect(page.getByRole('button', { name: /Overview/i }).first()).toBeVisible();
    await expect(page.getByText(/At a Glance/i).or(page.getByText(/Overview/i)).first()).toBeVisible();
    
    // Click Activity & Monitoring tab
    await page.getByRole('button', { name: /Activity & Monitoring/i }).first().click();
    
    // Verify Field Activity Monitoring visible
    await expect(page.getByText(/Field Activity Monitoring/i).first()).toBeVisible({ timeout: 10000 });
    
    // Click Maternal tab
    await page.getByRole('button', { name: /Maternal/i }).first().click();
    
    // Verify Active Pregnancies section visible
    await expect(page.getByText(/Active Pregnancies/i).first()).toBeVisible({ timeout: 10000 });
    
    // Click Medicines tab
    await page.getByRole('button', { name: /Medicines/i }).first().click();
    
    // Verify medicine approval interface visible
    await expect(page.getByText(/Approvals|Requests/i).first()).toBeVisible({ timeout: 10000 });
    
    // Click Reports tab
    await page.getByRole('button', { name: /Reports/i }).first().click();
    
    // Verify Sector Reports visible
    await expect(page.getByText(/Sector Report/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Phase 10 QA — Manager Master Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Manager full navigation workflow', async ({ page }) => {
    // Login as Manager (Rajesh Sharma)
    await page.getByRole('button', { name: /Rajesh Sharma/i }).click();
    
    // Verify PHC Administration visible
    await expect(page.getByText(/PHC Administration/i).first()).toBeVisible({ timeout: 15000 });
    
    // Verify Overview tab with inventory stats
    await expect(page.getByRole('button', { name: /Overview/i }).first()).toBeVisible();
    
    // Click Requisitions tab
    await page.getByRole('button', { name: /Requisitions/i }).first().click();
    
    // Verify Drug Requisitions Queue visible
    await expect(page.getByText(/Drug Requisitions Queue|Requisitions/i).first()).toBeVisible({ timeout: 10000 });
    
    // Click Manage Stock tab
    await page.getByRole('button', { name: /Manage Stock/i }).first().click();
    
    // Verify stock management interface visible
    await expect(page.getByText(/Manage Stock/i).first()).toBeVisible({ timeout: 10000 });
    
    // Click Reports tab
    await page.getByRole('button', { name: /Reports/i }).first().click();
    
    // Verify operations reports visible
    await expect(page.getByText(/Operations Report/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Phase 10 QA — Authentication Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Authentication and Session Security tests', async ({ page }) => {
    // Test that unauthenticated state shows login
    await expect(page.getByRole('button', { name: /Sunita Devi/i })).toBeVisible({ timeout: 10000 });
    
    // Login as ASHA
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).toBeVisible({ timeout: 15000 });
    
    // Test logout and re-login
    await page.getByLabel('Logout').or(page.getByRole('button', { name: /Logout/i })).first().click();
    await expect(page.getByRole('button', { name: /Sunita Devi/i })).toBeVisible({ timeout: 15000 });
    
    // Test that after logout, dashboard is not accessible
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).not.toBeVisible();
  });
});

test.describe('Phase 10 QA — Cross-Role Navigation Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Cross-Role Navigation Integrity tests', async ({ page }) => {
    // Login as each role sequentially
    // ASHA
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Supervisor Portal/i).first()).not.toBeVisible();
    await expect(page.getByText(/PHC Administration/i).first()).not.toBeVisible();
    await page.getByLabel('Logout').or(page.getByRole('button', { name: /Logout/i })).first().click();
    
    // Supervisor
    await page.getByRole('button', { name: /Dr\. Anita Roy/i }).click();
    await expect(page.getByText(/Supervisor Portal/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).not.toBeVisible();
    await expect(page.getByText(/PHC Administration/i).first()).not.toBeVisible();
    await page.getByLabel('Logout').or(page.getByRole('button', { name: /Logout/i })).first().click();
    
    // Manager
    await page.getByRole('button', { name: /Rajesh Sharma/i }).click();
    await expect(page.getByText(/PHC Administration/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/ASHA Field Dashboard/i).first()).not.toBeVisible();
    await expect(page.getByText(/Supervisor Portal/i).first()).not.toBeVisible();
    await page.getByLabel('Logout').or(page.getByRole('button', { name: /Logout/i })).first().click();
  });
});
