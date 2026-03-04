// spec: specs/comprehensive-saucedemo-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Authentication and Session Management', () => {
  test('Successful Login with Standard User', async ({ page }) => {
    // Navigate to https://www.saucedemo.com
    await page.goto('https://www.saucedemo.com');

    // Verify login page displays with username and password fields
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByText('Swag Labs')).toBeVisible();

    // Enter 'standard_user' in username field
    await page.locator('[data-test="username"]').fill('standard_user');
    await expect(page.locator('[data-test="username"]')).toHaveValue('standard_user');

    // Enter 'secret_sauce' in password field
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login button
    await page.locator('[data-test="login-button"]').click();

    // User is redirected to inventory page and product catalog is displayed
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });
});