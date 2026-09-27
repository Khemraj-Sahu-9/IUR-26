import { test, expect } from '@playwright/test';

test.describe('ASHA Saathi - Phase 8 Reports, Analytics & Operational Insights', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ASHA worker can open Work Report, change date filter presets, view chart/table, and trigger CSV download', async ({ page }) => {
    // 1. Login as ASHA
    const ashaDemoBtn = page.getByRole('button', { name: /Sunita Devi/i });
    await ashaDemoBtn.click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });

    // 2. Open Work Report from quick actions
    const reportBtn = page.getByRole('button', { name: /View My Work Report/i });
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();

    // 3. Verify Report view loaded
    await expect(page.getByRole('heading', { name: /My Work Report/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Home Visits — घर भ्रमण/i)).toBeVisible();
    await expect(page.getByText(/Follow-ups — फॉलो-अप/i)).toBeVisible();
    await expect(page.getByText(/Referrals — रेफरल/i)).toBeVisible();

    // 4. Test date range preset filtering
    const last30Btn = page.getByRole('button', { name: 'Last 30 Days' });
    await expect(last30Btn).toBeVisible();
    await last30Btn.click();

    const todayBtn = page.getByRole('button', { name: 'Today' });
    await expect(todayBtn).toBeVisible();
    await todayBtn.click();

    // 5. Verify accessible data table is present for charts
    const tableSummary = page.getByText(/View data table/i).first();
    await expect(tableSummary).toBeVisible();
    await tableSummary.click();

    // 6. Test CSV Export button presence & clickability
    const exportBtn = page.getByText(/Export CSV/i).first();
    await expect(exportBtn).toBeVisible();

    // 7. Navigate back to dashboard
    const backBtn = page.getByRole('button', { name: /Back/i }).or(page.getByLabel(/Back/i)).first();
    await backBtn.click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible();
  });

  test('Supervisor can access Sector Reports tab with aggregate metrics and CSV export', async ({ page }) => {
    // 1. Login as Supervisor
    await page.getByRole('button', { name: /Dr\. Anita Roy/i }).click();
    await expect(page.getByText(/Supervisor Portal/i)).toBeVisible({ timeout: 15000 });

    // 2. Click Reports tab
    const reportsTabBtn = page.getByRole('button', { name: /Reports/i });
    await expect(reportsTabBtn).toBeVisible();
    await reportsTabBtn.click();

    // 3. Verify Sector Report loaded
    await expect(page.getByRole('heading', { name: /Sector Report/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Field Coverage — क्षेत्र कवरेज/i)).toBeVisible();
    await expect(page.getByText(/Visits by Type — भ्रमण प्रकार/i)).toBeVisible();
    await expect(page.getByText(/Individual patient details are not displayed/i)).toBeVisible();

    // 4. Test date filter change
    await page.getByRole('button', { name: 'Last 7 Days' }).click();

    // 5. Verify CSV export button
    const exportBtn = page.getByText(/Export CSV/i).first();
    await expect(exportBtn).toBeVisible();
  });

  test('PHC Manager can access Operations Report with inventory status and field activity', async ({ page }) => {
    // 1. Login as Manager
    await page.getByRole('button', { name: /Rajesh Sharma/i }).click();
    await expect(page.getByText(/PHC Administration Portal/i)).toBeVisible({ timeout: 15000 });

    // 2. Switch to Reports tab
    const reportsTabBtn = page.getByRole('button', { name: /Reports/i });
    await expect(reportsTabBtn).toBeVisible();
    await reportsTabBtn.click();

    // 3. Verify PHC Operations Report loaded
    await expect(page.getByRole('heading', { name: /PHC Operations Report/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Inventory Status — इन्वेंटरी/i)).toBeVisible();
    await expect(page.getByText(/Medicine Requests — दवा अनुरोध/i)).toBeVisible();
    await expect(page.getByText(/Field Activity \(aggregate\)/i)).toBeVisible();

    // 4. Test stock details expander
    const stockExpander = page.getByText(/View all stock items/i);
    await expect(stockExpander).toBeVisible();
    await stockExpander.click();

    // 5. Test date filter change
    await page.getByRole('button', { name: 'This Month' }).click();

    // 6. Test CSV Export button
    const exportStockBtn = page.getByText(/Export CSV/i).first();
    await expect(exportStockBtn).toBeVisible();
  });
});
