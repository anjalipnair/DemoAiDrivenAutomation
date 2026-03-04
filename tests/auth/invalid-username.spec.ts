// spec: specs/comprehensive-saucedemo-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Authentication and Session Management', () => {
  test('Invalid Username Login Attempt', async ({ page }) => {
    // Navigate to login page
    await page.goto('https://www.saucedemo.com');

    // Login form is displayed
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();

    // Enter invalid username and valid password
    await page.locator('[data-test="username"]').fill('invalid_user');
    await page.locator('[data-test="password"]').fill('secret_sauce');

    // Click Login button to test invalid username error
    await page.locator('[data-test="login-button"]').click();

    // Error message displayed: 'Username and password do not match any user in this service'
    await expect(page.getByText('Username and password do not match any user in this service')).toBeVisible();
    
    // User remains on login page and login form is still visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
  });
});