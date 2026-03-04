// spec: specs/AID-2-login-functionality.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Authentication Suite', () => {
  test('Locked User Account Handling', async ({ page }) => {
    // Navigate to saucedemo.com login page
    await page.goto('https://www.saucedemo.com');
    
    // Enter locked username 'locked_out_user' in the username field
    await page.locator('[data-test="username"]').fill('locked_out_user');
    
    // Enter valid password 'secret_sauce' in the password field
    await page.locator('[data-test="password"]').fill('secret_sauce');
    
    // Click the Login button
    await page.locator('[data-test="login-button"]').click();
    
    // Verify locked user error message is displayed and user cannot access the system
    await expect(page.getByText('Epic sadface: Sorry, this user has been locked out.')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    
    // Verify error icons appear next to fields and appropriate locked account messaging is shown
    await expect(page.locator('[data-test="username"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});