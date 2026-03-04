// spec: specs/AID-2-login-functionality.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Authentication Suite', () => {
  test('Failed Login with Invalid Password', async ({ page }) => {
    // Navigate to saucedemo.com login page
    await page.goto('https://www.saucedemo.com');
    
    // Enter valid username 'standard_user' in the username field
    await page.locator('[data-test="username"]').fill('standard_user');
    
    // Enter invalid password 'wrong_password' in the password field
    await page.locator('[data-test="password"]').fill('wrong_password');
    
    // Click the Login button
    await page.locator('[data-test="login-button"]').click();
    
    // Verify error message is displayed and user remains on login page
    await expect(page.getByText('Epic sadface: Username and password do not match any user in this service')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    
    // Verify error icons appear next to both fields and login is prevented
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});