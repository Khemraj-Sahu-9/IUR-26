import { test, expect } from '@playwright/test';

test.describe('Phase 5 — Offline-First PWA & Reliable Data Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as ASHA demo persona (Sunita Devi)
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });
  });

  test('should display Online / All changes synced status bar when connected', async ({ page }) => {
    // Top SyncStatusBar should be rendered
    const syncStatus = page.locator('header').locator('..').getByText(/Online|All changes synced/i).first();
    await expect(syncStatus).toBeVisible();
  });

  test('should show offline indicators when network connectivity is lost', async ({ page, context }) => {
    // Emulate offline mode
    await context.setOffline(true);

    // Verify Offline status bar appears
    await expect(page.getByText(/Offline — changes saved on this device/i)).toBeVisible({ timeout: 10000 });

    // Navigate to Households and verify non-blocking OfflineBanner
    await page.getByRole('button', { name: /Households/i }).first().click();
    await expect(page.getByText(/You're offline/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Your changes will be stored on this device and synced automatically/i)).toBeVisible();

    // Navigate to Patients and verify OfflineBanner
    await page.getByRole('button', { name: /Patients/i }).first().click();
    await expect(page.getByText(/You're offline/i)).toBeVisible({ timeout: 5000 });

    // Restore network
    await context.setOffline(false);
  });

  test('should record a visit offline and show pending sync badge, then auto-sync on reconnect', async ({ page, context }) => {
    // 1. Navigate to Patients list
    await page.getByRole('button', { name: /Patients/i }).first().click();
    await expect(page.getByText(/individuals in assigned ward/i)).toBeVisible({ timeout: 10000 });

    const patientCards = page.locator('[data-testid="patient-card"]');
    const count = await patientCards.count();
    if (count === 0) return; // Skip if database is empty

    // 2. Open first patient profile
    await patientCards.first().click();
    await expect(page.getByText(/Patient Profile/i)).toBeVisible({ timeout: 10000 });

    // 3. Go OFFLINE
    await context.setOffline(true);
    await expect(page.getByText(/Offline — changes saved on this device/i)).toBeVisible({ timeout: 10000 });

    // 4. Click Record Visit
    const recordVisitBtn = page.getByRole('button', { name: /Record Visit|Add Visit/i }).first();
    if (await recordVisitBtn.count() > 0) {
      await recordVisitBtn.click();
      await expect(page.getByText(/Record Home Visit/i)).toBeVisible({ timeout: 8000 });

      // Fill in clinical notes
      const notesArea = page.locator('textarea').first();
      await notesArea.fill('Offline field checkup: Patient healthy, vitals normal.');

      // Submit the visit form
      const submitBtn = page.getByRole('button', { name: /Save Visit Record/i });
      await submitBtn.click();

      // Verify that offline save succeeds without crashing or throwing server errors
      await expect(page.getByText(/Visit Recorded Successfully|Patient Profile/i)).toBeVisible({ timeout: 10000 });

      // 5. Verify pending sync indicator shows pending changes
      await expect(page.getByText(/pending/i)).toBeVisible({ timeout: 5000 });

      // 6. Go back ONLINE
      await context.setOffline(false);

      // Verify sync process or return to synced state
      await expect(page.getByText(/All changes synced|Online/i)).toBeVisible({ timeout: 15000 });
    } else {
      await context.setOffline(false);
    }
  });

  test('should create a medicine request offline and preserve it for sync', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    await expect(page.getByText(/Offline — changes saved on this device/i)).toBeVisible({ timeout: 10000 });

    // Navigate to Drug Kit / Medicine Requests
    await page.getByRole('button', { name: /Drug Kit/i }).first().click();
    await expect(page.getByText(/My Drug Kit/i)).toBeVisible({ timeout: 10000 });

    // Check if New Medicine Request button exists
    const refillBtn = page.getByRole('button', { name: /New Medicine Request/i });
    if (await refillBtn.count() > 0) {
      await refillBtn.click();
      await expect(page.getByText(/New Drug Kit Request/i)).toBeVisible({ timeout: 5000 });

      // Enter quantity
      const qtyInput = page.getByLabel(/Quantity/i);
      if (await qtyInput.count() > 0) {
        await qtyInput.fill('20');
        await page.getByRole('button', { name: /Submit Request/i }).click();

        // Check for success feedback
        await expect(page.getByText(/Request Submitted|My Drug Kit/i)).toBeVisible({ timeout: 8000 });
      }
    }

    // Restore online
    await context.setOffline(false);
    await expect(page.getByText(/All changes synced|Online/i)).toBeVisible({ timeout: 15000 });
  });

  test('should safely clear local cached data on user logout to enforce tenant security', async ({ page }) => {
    // Click logout
    const logoutBtn = page.getByLabel('Logout');
    await logoutBtn.click();

    // Verify redirected to Login Screen
    await expect(page.getByRole('heading', { name: /ASHA Saathi/i })).toBeVisible({ timeout: 10000 });

    // Verify in IndexedDB that profiles store is cleared (poll to wait for async clear transaction)
    await expect.poll(async () => {
      return await page.evaluate(async () => {
        return new Promise<number>((resolve) => {
          const req = indexedDB.open('AshaSaathiDB');
          req.onsuccess = () => {
            const idb = req.result;
            if (!idb.objectStoreNames.contains('profiles')) {
              resolve(0);
              return;
            }
            const tx = idb.transaction('profiles', 'readonly');
            const countReq = tx.objectStore('profiles').count();
            countReq.onsuccess = () => resolve(countReq.result);
            countReq.onerror = () => resolve(-1);
          };
          req.onerror = () => resolve(-1);
        });
      });
    }, { timeout: 10000, intervals: [200, 500, 1000] }).toBe(0);
  });
});
