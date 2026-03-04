// spec: specs/AID-2-login-functionality.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Validation Suite', () => {
  test('Empty Username Validation', async ({ page }) => {
    // Navigate to saucedemo.com login page
    await page.goto('https://www.saucedemo.com');
    
    // Verify login page is displayed with empty form fields
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    
    // Leave username field empty and enter password 'secret_sauce'
    await page.locator('[data-test="password"]').fill('secret_sauce');
    
    // Verify password field contains masked characters and username field remains empty
    await expect(page.locator('[data-test="password"]')).toHaveValue('secret_sauce');
    await expect(page.locator('[data-test="username"]')).toHaveValue('');
    
    // Click the Login button
    await page.locator('[data-test="login-button"]').click();
    
    // Verify error message and form validation works correctly
    await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});