// spec: specs/AID-2-login-functionality.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Authentication Suite', () => {
  test('Failed Login with Invalid Username', async ({ page }) => {
    // Navigate to saucedemo.com login page
    await page.goto('https://www.saucedemo.com');
    
    // Enter invalid username 'invalid_user' in the username field
    await page.locator('[data-test="username"]').fill('invalid_user');
    
    // Enter valid password 'secret_sauce' in the password field
    await page.locator('[data-test="password"]').fill('secret_sauce');
    
    // Click the Login button
    await page.locator('[data-test="login-button"]').click();
    
    // Verify error message is displayed and user remains on login page
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    // Click the error message close button (X)
    await page.locator('[data-test="error-button"]').click();
    
    // Verify error message disappears and form is ready for new input
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).not.toBeVisible();
  });
});