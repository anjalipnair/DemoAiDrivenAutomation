// Example: How to use the Test Data Manager in Playwright tests
import { test, expect } from '@playwright/test';
import { testData, getValidUser, getProduct, getCustomer, getSelector } from '../utils/testDataManager';

test.describe('Authentication Tests with Centralized Test Data', () => {
  
  test('Successful login with standard user', async ({ page }) => {
    // Get test data from centralized source
    const user = getValidUser('standard');
    const baseUrl = testData.getBaseUrl();
    const selectors = {
      username: getSelector('login', 'username'),
      password: getSelector('login', 'password'), 
      loginButton: getSelector('login', 'loginButton')
    };
    
    // Navigate to application
    await page.goto(baseUrl);
    
    // Perform login using centralized test data
    await page.locator(selectors.username).fill(user.username);
    await page.locator(selectors.password).fill(user.password);
    await page.locator(selectors.loginButton).click();
    
    // Verify successful login
    await expect(page).toHaveURL(new RegExp(testData.getUrl('inventory')));
    await expect(page.getByText(testData.getExpectedText('inventoryTitle'))).toBeVisible();
  });
  
  test('Failed login with invalid credentials', async ({ page }) => {
    const user = getInvalidUser('invalid');
    const baseUrl = testData.getBaseUrl();
    const expectedError = testData.getErrorMessage('invalidCredentials');
    
    await page.goto(baseUrl);
    await page.locator(getSelector('login', 'username')).fill(user.username);
    await page.locator(getSelector('login', 'password')).fill(user.password);
    await page.locator(getSelector('login', 'loginButton')).click();
    
    // Verify error message
    await expect(page.locator(getSelector('login', 'errorMessage'))).toHaveText(expectedError);
  });
});

test.describe('Shopping Cart Tests with Test Data', () => {
  
  test('Add multiple products to cart', async ({ page }) => {
    // Login first
    const user = getValidUser('standard');
    await page.goto(testData.getBaseUrl());
    await page.locator(getSelector('login', 'username')).fill(user.username);
    await page.locator(getSelector('login', 'password')).fill(user.password);
    await page.locator(getSelector('login', 'loginButton')).click();
    
    // Get product test data set
    const products = testData.getProductSet('multipleItems'); // backpack, bikeLight
    
    // Add each product to cart
    for (const product of products) {
      await page.locator(product.addToCartSelector).click();
    }
    
    // Verify cart count
    await expect(page.locator(getSelector('navigation', 'cartBadge'))).toHaveText(products.length.toString());
    
    // Navigate to cart and verify products
    await page.locator(getSelector('navigation', 'cartLink')).click();
    
    for (const product of products) {
      await expect(page.getByText(product.name)).toBeVisible();
      await expect(page.getByText(`$${product.price}`)).toBeVisible();
    }
  });
});

test.describe('Checkout Tests with Customer Data', () => {
  
  test('Complete checkout with valid information', async ({ page }) => {
    // Setup: Login and add product to cart
    const user = getValidUser('standard');
    const product = getProduct('backpack');
    const customer = getCustomer('customer1');
    
    await page.goto(testData.getBaseUrl());
    await page.locator(getSelector('login', 'username')).fill(user.username);
    await page.locator(getSelector('login', 'password')).fill(user.password);
    await page.locator(getSelector('login', 'loginButton')).click();
    
    await page.locator(product.addToCartSelector).click();
    await page.locator(getSelector('navigation', 'cartLink')).click();
    await page.locator(getSelector('cart', 'checkoutButton')).click();
    
    // Fill checkout form with test data
    await page.locator(getSelector('checkout', 'firstName')).fill(customer.firstName);
    await page.locator(getSelector('checkout', 'lastName')).fill(customer.lastName);
    await page.locator(getSelector('checkout', 'postalCode')).fill(customer.zipCode);
    await page.locator(getSelector('checkout', 'continueButton')).click();
    
    // Verify checkout overview
    await expect(page.getByText(product.name)).toBeVisible();
    await expect(page.getByText(testData.getPaymentInfo().cardNumber)).toBeVisible();
    await expect(page.getByText(testData.getShippingInfo().method)).toBeVisible();
    
    // Complete order
    await page.locator(getSelector('checkout', 'finishButton')).click();
    
    // Verify completion message
    const completionMessage = testData.getCheckoutMessage('orderComplete');
    await expect(page.getByText(completionMessage.header)).toBeVisible();
  });
});

// Example of data-driven testing
test.describe('Data-Driven Authentication Tests', () => {
  
  // Test all valid users
  const validUsers = testData.getAllValidUsers();
  Object.entries(validUsers).forEach(([userKey, userData]) => {
    test(`Login success for ${userKey}`, async ({ page }) => {
      await page.goto(testData.getBaseUrl());
      await page.locator(getSelector('login', 'username')).fill(userData.username);
      await page.locator(getSelector('login', 'password')).fill(userData.password);
      await page.locator(getSelector('login', 'loginButton')).click();
      
      await expect(page).toHaveURL(new RegExp(testData.getUrl('inventory')));
    });
  });
  
  // Test all invalid users
  const invalidUsers = testData.getAllInvalidUsers();
  Object.entries(invalidUsers).forEach(([userKey, userData]) => {
    test(`Login failure for ${userKey}`, async ({ page }) => {
      await page.goto(testData.getBaseUrl());
      await page.locator(getSelector('login', 'username')).fill(userData.username);
      await page.locator(getSelector('login', 'password')).fill(userData.password);
      await page.locator(getSelector('login', 'loginButton')).click();
      
      if (userData.expectedError) {
        await expect(page.locator(getSelector('login', 'errorMessage'))).toContainText(userData.expectedError);
      }
    });
  });
});