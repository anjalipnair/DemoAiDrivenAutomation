// spec: specs/orangehrm-comprehensive-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Solutions Section Testing Suite', () => {
  test('Solutions Navigation and Structure', async ({ page }) => {
    // 1. Navigate to OrangeHRM homepage (https://www.orangehrm.com/)
    await page.goto('https://www.orangehrm.com/');

    // Verify page loads successfully and main heading is visible
    await expect(page.getByText('Streamline All Your HR Needs on One Intuitive Platform')).toBeVisible();

    // Verify navigation menu is visible and Solutions link is prominently displayed
    await expect(page.getByRole('link', { name: 'Solutions' })).toBeVisible();

    // 2. Accept cookie consent dialog if present
    // Check if cookie consent dialog is present and handle it gracefully
    try {
      await expect(page.getByRole('button', { name: 'Allow all' })).toBeVisible({ timeout: 3000 });
      await page.getByRole('button', { name: 'Allow all' }).click();
    } catch (error) {
      // Cookie dialog not present or already dismissed - continue with test
    }

    // 3. Hover over or click Solutions navigation link
    await page.getByRole('link', { name: 'Solutions' }).click();

    // 4. Verify Solutions dropdown structure contains main categories
    // Verify Starter (Open Source) option is visible
    await expect(page.getByRole('link', { name: 'Starter (Open Source)' })).toBeVisible();

    // Verify Advanced (30 Day Free Trial) option is visible
    await expect(page.getByRole('link', { name: 'Advanced (30 Day Free Trial)' })).toBeVisible();

    // Verify Connectors section is available
    await expect(page.locator('a[href="/en/solutions/connectors"]').first()).toBeVisible();

    // Verify OrangeHRM AI (NEW) is highlighted
    await expect(page.getByRole('link', { name: 'OrangeHRM AI NEW' })).toBeVisible();

    // 5. Verify core solution areas are displayed in dropdown
    // Verify People Management category is present
    await expect(page.getByRole('link', { name: 'People Management' })).toBeVisible();

    // Verify Talent Management category is present
    await expect(page.getByRole('link', { name: 'Talent Management' })).toBeVisible();

    // Verify Compensation category is present
    await expect(page.getByRole('link', { name: 'Compensation' })).toBeVisible();

    // Verify Culture category is present
    await expect(page.getByRole('link', { name: 'Culture' })).toBeVisible();
  });
});