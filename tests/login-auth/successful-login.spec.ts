// spec: specs/AID-2-login-functionality.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login Authentication Suite', () => {
  test('Successful Login with Valid Credentials', async ({ page }) => {
    // Navigate to saucedemo.com login page
    await page.goto('https://www.saucedemo.com');
    
    // Verify login page elements are visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    // Enter valid username 'standard_user' in the username field
    await page.locator('[data-test="username"]').fill('standard_user');
    
    // Enter valid password 'secret_sauce' in the password field
    await page.locator('[data-test="password"]').fill('secret_sauce');
    
    // Click the Login button
    await page.locator('[data-test="login-button"]').click();
    
    // Verify user is redirected to inventory/products page and session is established
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
    
    // Verify session maintenance by navigating between pages
    await page.locator('[data-test="item-4-img-link"]').click();
    await expect(page).toHaveURL(/.*inventory-item\.html/);
    
    // Navigate back to products to verify session persists across page navigation
    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.getByText('Products')).toBeVisible();
  });
});