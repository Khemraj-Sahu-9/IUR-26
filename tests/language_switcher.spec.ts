import { test, expect } from '@playwright/test';

test.describe('Language Switcher & Bilingual Localization Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('asha_lang', 'en');
    });
  });

  test('should display language selector on login screen and switch between English and Hindi', async ({ page }) => {
    // 1. Initial English view
    await expect(page.getByText(/Quick Demo Personas/i)).toBeVisible();
    await expect(page.getByText(/Standard Login/i)).toBeVisible();

    // 2. Open Language Selector on Login screen
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // 3. Dropdown options visible
    await expect(page.getByRole('option', { name: /हिन्दी/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /English/i })).toBeVisible();

    // 4. Select Hindi
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // 5. Verify UI transitions to Hindi
    await expect(page.getByText(/त्वरित डेमो प्रोफाइल/i)).toBeVisible();
    await expect(page.getByText(/मानक लॉगिन/i)).toBeVisible();

    // 6. Switch back to English
    await langBtn.click();
    await page.getByRole('option', { name: /English/i }).click();

    // 7. Verify UI returns to English
    await expect(page.getByText(/Quick Demo Personas/i)).toBeVisible();
    await expect(page.getByText(/Standard Login/i)).toBeVisible();
  });

  test('should switch language for ASHA worker and update dashboard and bottom navigation', async ({ page }) => {
    // Login as ASHA (Sunita Devi)
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });

    // Open Language Selector in header
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();

    // Select Hindi
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // Verify Dashboard translates to Hindi
    await expect(page.getByText(/आशा कार्यक्षेत्र डैशबोर्ड/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/परिवार सूची|परिवार/i).first()).toBeVisible();

    // Switch back to English
    await langBtn.click();
    await page.getByRole('option', { name: /English/i }).click();

    // Verify Dashboard translates back to English
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 10000 });
  });

  test('should persist selected language across page navigation and refresh', async ({ page }) => {
    // Login as ASHA
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });

    // Switch to Hindi
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();
    await expect(page.getByText(/आशा कार्यक्षेत्र डैशबोर्ड/i)).toBeVisible();

    // Navigate to Households
    await page.getByRole('button', { name: /परिवार/i }).first().click();
    await expect(page.getByText(/परिवार सूची/i).first()).toBeVisible();

    // Refresh page
    await page.reload();
    await expect(page.getByText(/ASHA Saathi/i).first()).toBeVisible({ timeout: 15000 });

    // Verify language is still Hindi after reload
    await expect(page.getByText(/आशा कार्यक्षेत्र डैशबोर्ड|परिवार सूची/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('should support language switching for Supervisor role', async ({ page }) => {
    // Login as Supervisor
    await page.getByRole('button', { name: /Dr\. Anita Roy/i }).click();
    await expect(page.getByText(/Overview/i).first()).toBeVisible({ timeout: 15000 });

    // Switch to Hindi
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // Verify Supervisor tabs update to Hindi
    await expect(page.getByText(/अवलोकन/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/गतिविधि एवं निगरानी/i).first()).toBeVisible();
    await expect(page.getByText(/मातृ स्वास्थ्य/i).first()).toBeVisible();

    // Switch back to English
    await langBtn.click();
    await page.getByRole('option', { name: /English/i }).click();
    await expect(page.getByText(/Overview/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should support language switching for Manager role', async ({ page }) => {
    // Login as Manager
    await page.getByRole('button', { name: /Rajesh Sharma/i }).click();
    await expect(page.getByText(/Overview/i).first()).toBeVisible({ timeout: 15000 });

    // Switch to Hindi
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // Verify Manager tabs update to Hindi
    await expect(page.getByText(/अवलोकन/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/दवा मांग/i).first()).toBeVisible();

    // Switch back to English
    await langBtn.click();
    await page.getByRole('option', { name: /English/i }).click();
    await expect(page.getByText(/Overview/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should switch and retain language when offline', async ({ page }) => {
    // Login as ASHA
    await page.getByRole('button', { name: /Sunita Devi/i }).click();
    await expect(page.getByText(/ASHA Field Dashboard/i)).toBeVisible({ timeout: 15000 });

    // Go offline
    await page.context().setOffline(true);

    // Switch to Hindi while offline
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // Verify Hindi renders offline without network
    await expect(page.getByText(/आशा कार्यक्षेत्र डैशबोर्ड/i)).toBeVisible({ timeout: 10000 });

    // Restore online
    await page.context().setOffline(false);
  });
});
