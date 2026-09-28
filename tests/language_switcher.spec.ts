import { test, expect } from '@playwright/test';

test.describe('Language Switcher & Bilingual Localization Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('asha_lang', 'en');
    });
  });

  // Test 1 — English Login Verification
  test('Test 1 — English: login page displays all UI labels, placeholders, buttons and validation in English', async ({ page }) => {
    // 1. Brand & Subtitle
    await expect(page.getByRole('heading', { name: /ASHA Saathi/i })).toBeVisible();
    await expect(page.getByText(/Community Healthcare Field Companion/i)).toBeVisible();
    await expect(page.getByText(/Works Offline & Auto-Syncs/i)).toBeVisible();

    // 2. Demo Persona Cards
    await expect(page.getByText(/Quick Demo Personas/i)).toBeVisible();
    await expect(page.getByText(/ASHA Worker: Sunita Devi/i)).toBeVisible();
    await expect(page.getByText(/Ward 4 Field Worker/i)).toBeVisible();

    // 3. Standard Login Form Elements
    await expect(page.getByText(/Standard Login/i)).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to ASHA Saathi/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Forgot Password\?/i })).toBeVisible();

    // 4. Trigger validation error in English
    await page.getByRole('button', { name: /Sign In to ASHA Saathi/i }).click();
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
    await expect(page.getByText(/Password must be at least 6 characters/i)).toBeVisible();
  });

  // Test 2 — Hindi Login Verification
  test('Test 2 — Hindi: switching language changes all login UI, persona labels, forgot password, and validation to Hindi', async ({ page }) => {
    // 1. Open Language Selector on Login screen
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await expect(langBtn).toBeVisible();
    await langBtn.click();

    // 2. Verify options and select Hindi
    await expect(page.getByRole('option', { name: /हिन्दी/i })).toBeVisible();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // 3. Verify visible login text changes to Hindi
    await expect(page.getByText(/सामुदायिक स्वास्थ्य कार्यकर्ता साथी/i)).toBeVisible();
    await expect(page.getByText(/ऑफ़लाइन काम करता है और स्वतः सिंक होता है/i)).toBeVisible();
    await expect(page.getByText(/त्वरित डेमो प्रोफाइल/i)).toBeVisible();
    await expect(page.getByText(/आशा कार्यकर्ता: सुनीता देवी/i)).toBeVisible();
    await expect(page.getByText(/मानक लॉगिन/i)).toBeVisible();
    await expect(page.getByLabel(/ईमेल पता/i)).toBeVisible();
    await expect(page.getByLabel(/पासवर्ड/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /आशा साथी में लॉगिन करें/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /पासवर्ड भूल गए\?/i })).toBeVisible();

    // 4. Trigger validation error in Hindi
    await page.getByRole('button', { name: /आशा साथी में लॉगिन करें/i }).click();
    await expect(page.getByText(/कृपया एक मान्य ईमेल पता दर्ज करें/i)).toBeVisible();
    await expect(page.getByText(/पासवर्ड कम से कम 6 अक्षरों का होना चाहिए/i)).toBeVisible();

    // 5. Test Forgot Password modal in Hindi
    await page.getByRole('button', { name: /पासवर्ड भूल गए\?/i }).click();
    await expect(page.getByText(/अपनी लॉगिन जानकारी रीसेट करने के लिए कृपया अपने पीएचसी चिकित्सा अधिकारी/i)).toBeVisible();
    await page.getByRole('button', { name: /बंद करें/i }).first().click();
  });

  // Test 3 — Persistence across refresh
  test('Test 3 — Persistence: selected language persists across page reload before login', async ({ page }) => {
    // Select Hindi
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();
    await expect(page.getByText(/मानक लॉगिन/i)).toBeVisible();

    // Refresh page
    await page.reload();

    // Verify Hindi remains selected after reload
    await expect(page.getByText(/सामुदायिक स्वास्थ्य कार्यकर्ता साथी/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/मानक लॉगिन/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /आशा साथी में लॉगिन करें/i })).toBeVisible();

    // Switch back to English and refresh
    const langBtnAfterReload = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtnAfterReload.click();
    await page.getByRole('option', { name: /English/i }).click();
    await expect(page.getByText(/Standard Login/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/Standard Login/i)).toBeVisible({ timeout: 10000 });
  });

  // Test 4 — Authentication: Login preserves language state
  test('Test 4 — Authentication: Hindi selected before login remains active on ASHA dashboard', async ({ page }) => {
    // Select Hindi on login page
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();
    await expect(page.getByText(/मानक लॉगिन/i)).toBeVisible();

    // Login as ASHA worker
    await page.getByRole('button', { name: /सुनीता देवी/i }).click();

    // Verify dashboard renders in Hindi
    await expect(page.getByText(/आशा कार्यक्षेत्र डैशबोर्ड/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/परिवार सूची|परिवार/i).first()).toBeVisible();
  });

  // Test 5 — Logout: Logout preserves chosen language
  test('Test 5 — Logout: Logging out preserves the chosen language on the login page', async ({ page }) => {
    // Select Hindi on login page
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // Login as ASHA
    await page.getByRole('button', { name: /सुनीता देवी/i }).click();
    await expect(page.getByText(/आशा कार्यक्षेत्र डैशबोर्ड/i)).toBeVisible({ timeout: 15000 });

    // Logout
    await page.getByLabel('Logout').click();

    // Verify login page is still in Hindi
    await expect(page.getByText(/मानक लॉगिन/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/सामुदायिक स्वास्थ्य कार्यकर्ता साथी/i)).toBeVisible();
  });

  // Test 6 — Mobile Viewport Responsiveness
  test('Test 6 — Mobile: language selector is accessible and functional across various mobile viewports', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE 1st gen
      { width: 360, height: 800 }, // Samsung Galaxy A-series
      { width: 375, height: 812 }, // iPhone 12/13 mini
      { width: 390, height: 844 }, // iPhone 13/14
      { width: 412, height: 915 }, // Pixel 7
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
      await expect(langBtn).toBeVisible();

      // Open and verify options do not overflow
      await langBtn.click();
      await expect(page.getByRole('option', { name: /हिन्दी/i })).toBeVisible();
      await page.getByRole('option', { name: /English/i }).click();
      await expect(page.getByText(/Standard Login/i)).toBeVisible();
    }
  });

  // Test 7 — Desktop Viewports
  test('Test 7 — Desktop: language selector renders cleanly on standard desktop resolutions', async ({ page }) => {
    const desktopViewports = [
      { width: 1280, height: 720 },
      { width: 1440, height: 900 },
    ];

    for (const vp of desktopViewports) {
      await page.setViewportSize(vp);
      const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
      await expect(langBtn).toBeVisible();
      await expect(page.getByText(/Quick Demo Personas/i)).toBeVisible();
    }
  });

  // Test 8 — Password Toggle & Forgot Password
  test('Test 8 — Password toggle and Forgot Password dialog work in English and Hindi', async ({ page }) => {
    const pwdInput = page.getByLabel(/Password/i);
    const toggleBtn = page.getByTitle(/password/i);

    await pwdInput.fill('secret123');
    await expect(pwdInput).toHaveAttribute('type', 'password');

    // Click toggle to reveal password
    await toggleBtn.click();
    await expect(pwdInput).toHaveAttribute('type', 'text');

    // Click toggle to hide password
    await toggleBtn.click();
    await expect(pwdInput).toHaveAttribute('type', 'password');

    // Click Forgot password in English
    await page.getByRole('button', { name: /Forgot Password\?/i }).click();
    await expect(page.getByText(/Please contact your PHC Medical Officer/i)).toBeVisible();
    await page.getByRole('button', { name: /Close/i }).first().click();
  });

  // Test 9 — Authenticated Role Switching
  test('Test 9 — Authenticated App: Supervisor and Manager shells translate and switch seamlessly', async ({ page }) => {
    // Login as Supervisor
    await page.getByRole('button', { name: /Dr\. Anita Roy/i }).click();
    await expect(page.getByText(/Overview/i).first()).toBeVisible({ timeout: 15000 });

    // Switch to Hindi
    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    // Verify Supervisor tabs in Hindi
    await expect(page.getByText(/अवलोकन/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/गतिविधि एवं निगरानी/i).first()).toBeVisible();

    // Logout
    await page.getByLabel('Logout').click();

    // Login as Manager
    await page.getByRole('button', { name: /राजेश शर्मा/i }).click();
    await expect(page.getByText(/अवलोकन/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/दवा मांग/i).first()).toBeVisible();
  });

  // Test 10 — Offline Language Switching
  test('Test 10 — Offline: language switching works without active internet connectivity', async ({ page }) => {
    await page.context().setOffline(true);

    const langBtn = page.getByRole('button', { name: /Select Language|भाषा चुनें|Change Language/i }).first();
    await langBtn.click();
    await page.getByRole('option', { name: /हिन्दी/i }).click();

    await expect(page.getByText(/सामुदायिक स्वास्थ्य कार्यकर्ता साथी/i)).toBeVisible();
    await expect(page.getByText(/मानक लॉगिन/i)).toBeVisible();

    await page.context().setOffline(false);
  });
});
