import { test, expect } from '@playwright/test';
import { apiClient } from '../../utils/apiClient';
import { testData } from '../../utils/testDataManager';

/**
 * Simple API Test Examples
 * These tests demonstrate common API testing patterns and can be easily
 * adapted for different endpoints and scenarios
 */

test.describe('Simple API Examples', () => {

  // Example 1: Basic Authentication Test  
  test('Login API - Valid User', async () => {
    // Get test data
    const user = testData.getUser('validUsers', 'standard');
    
    // Call API
    const result = await apiClient.login(user.username, user.password);
    
    // Verify results
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data.user.username).toBe(user.username);
    
    console.log('✅ Login successful for:', user.username);
  });

  // Example 2: Product Catalog Test
  test('Get Products API', async () => {
    const result = await apiClient.getProducts();
    
    // Basic validations
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data.products).toBeDefined();
    expect(result.data.products.length).toBe(6);
    
    // Verify product structure
    const product = result.data.products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(typeof product.price).toBe('number');
    
    console.log('✅ Retrieved', result.data.products.length, 'products');
  });

  // Example 3: Shopping Cart Flow
  test('Shopping Cart API Flow', async () => {
    // Step 1: Login
    const user = testData.getUser('validUsers', 'standard');
    await apiClient.login(user.username, user.password);
    
    // Step 2: Get empty cart
    const emptyCart = await apiClient.getCart();
    expect(emptyCart.data.itemCount).toBe(0);
    
    // Step 3: Add product to cart
    const product = testData.getProduct('backpack');
    const addResult = await apiClient.addToCart(product.id, 2);
    expect(addResult.passed).toBe(true);
    
    // Step 4: Verify cart has items
    const updatedCart = await apiClient.getCart();
    expect(updatedCart.data.itemCount).toBe(2);
    expect(updatedCart.data.totalAmount).toBe(product.price * 2);
    
    console.log('✅ Cart flow completed with', updatedCart.data.itemCount, 'items');
  });

  // Example 4: Error Handling Test
  test('Invalid Login - Error Handling', async () => {
    const invalidUser = testData.getUser('invalidUsers', 'invalid');
    
    const result = await apiClient.login(invalidUser.username, invalidUser.password);
    
    // Verify error response
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain('Invalid username or password');
    
    console.log('✅ Error handling verified for invalid credentials');
  });

  // Example 5: Performance Test
  test('Response Time Check', async () => {
    const startTime = Date.now();
    
    const result = await apiClient.getProducts();
    
    const responseTime = Date.now() - startTime;
    
    expect(result.passed).toBe(true);
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    
    console.log('✅ Response time:', responseTime, 'ms');
  });

  // Example 6: Data Validation Test
  test('Product Data Validation', async () => {
    const result = await apiClient.getProducts();
    
    expect(result.passed).toBe(true);
    
    // Validate each product has required fields and correct data types
    result.data.products.forEach((product, index) => {
      expect(product.id, `Product ${index} missing id`).toBeTruthy();
      expect(product.name, `Product ${index} missing name`).toBeTruthy();
      expect(typeof product.price, `Product ${index} price not a number`).toBe('number');
      expect(product.price, `Product ${index} price should be positive`).toBeGreaterThan(0);
    });
    
    console.log('✅ All products have valid data structure');
  });
});

/**
 * API Testing Scenarios from Test Plan
 * These implement the specific scenarios defined in comprehensive-saucedemo-test-plan.md
 */
test.describe('Test Plan API Scenarios', () => {

  // Test Scenario: Authentication API Coverage
  test('API-AUTH-001: Standard User Login', async () => {
    const scenario = testData.getApiScenario('authentication', 'standardLogin');
    const user = testData.getUser('validUsers', 'standard');
    
    const result = await apiClient.login(user.username, user.password);
    
    // Apply test scenario validations
    scenario.validations.forEach(validation => {
      switch(validation.field) {
        case 'statusCode':
          expect(result.statusCode).toBe(validation.expected);
          break;
        case 'responseSchema':
          expect(result.data).toHaveProperty('sessionToken');
          expect(result.data).toHaveProperty('user');
          break;
        case 'responseTime':
          expect(result.responseTime).toBeLessThan(validation.expected);
          break;
      }
    });
    
    console.log('✅ API-AUTH-001 passed');
  });

  // Test Scenario: Inventory API Coverage
  test('API-INV-001: Product Catalog Retrieval', async () => {
    const scenario = testData.getApiScenario('inventory', 'getAllProducts');
    
    const result = await apiClient.getProducts();
    
    // Validate response structure and content
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data.products.length).toBe(6);
    
    // Check performance benchmark
    const performanceBenchmark = scenario.performance?.responseTime || 5000;
    expect(result.responseTime).toBeLessThan(performanceBenchmark);
    
    console.log('✅ API-INV-001 passed in', result.responseTime, 'ms');
  });

  // Test Scenario: Cart API Coverage  
  test('API-CART-001: Add Multiple Items', async () => {
    // Setup
    const user = testData.getUser('validUsers', 'standard');
    await apiClient.login(user.username, user.password);
    await apiClient.clearCart();
    
    const scenario = testData.getApiScenario('cart', 'addMultipleItems');
    const products = testData.getProductSet('multipleItems');
    
    // Execute scenario
    for (const product of products) {
      const result = await apiClient.addToCart(product.id, 1);
      expect(result.passed).toBe(true);
    }
    
    // Validate final cart state
    const cartResult = await apiClient.getCart();
    expect(cartResult.data.itemCount).toBe(products.length);
    
    const expectedTotal = products.reduce((sum, p) => sum + p.price, 0);
    expect(cartResult.data.totalAmount).toBeCloseTo(expectedTotal, 2);
    
    console.log('✅ API-CART-001 passed - Added', products.length, 'items');
  });

  // Test Scenario: Checkout API Coverage
  test('API-CHECKOUT-001: Complete Order Flow', async () => {
    // Setup authenticated session with cart items
    const user = testData.getUser('validUsers', 'standard');
    await apiClient.login(user.username, user.password);
    await apiClient.clearCart();
    
    const product = testData.getProduct('backpack');
    await apiClient.addToCart(product.id, 1);
    
    // Execute checkout scenario
    const scenario = testData.getApiScenario('checkout', 'completeOrder');
    const customer = testData.getCustomer('customer1');
    
    // Submit customer info
    const customerResult = await apiClient.submitCustomerInfo(
      customer.firstName,
      customer.lastName,
      customer.zipCode
    );
    expect(customerResult.passed).toBe(true);
    
    // Get order summary
    const summaryResult = await apiClient.getOrderSummary();
    expect(summaryResult.passed).toBe(true);
    expect(summaryResult.data).toHaveProperty('total');
    
    // Complete order
    const orderResult = await apiClient.completeOrder();
    expect(orderResult.passed).toBe(true);
    expect(orderResult.data.status).toBe('completed');
    expect(orderResult.data).toHaveProperty('orderId');
    
    console.log('✅ API-CHECKOUT-001 passed - Order:', orderResult.data.orderId);
  });
});

/**
 * Quick API Health Check
 * Basic smoke tests to verify API is responding correctly
 */
test.describe('API Health Check', () => {

  test('All Critical Endpoints Responding', async () => {
    const endpoints = [
      { name: 'Products API', test: () => apiClient.getProducts() },
      { name: 'Login API', test: () => apiClient.login('standard_user', 'secret_sauce') }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`Testing ${endpoint.name}...`);
      
      const result = await endpoint.test();
      
      expect(result.passed, `${endpoint.name} failed`).toBe(true);
      expect(result.statusCode, `${endpoint.name} returned wrong status`).toBe(200);
      expect(result.responseTime, `${endpoint.name} too slow`).toBeLessThan(10000);
      
      console.log(`✅ ${endpoint.name} - ${result.responseTime}ms`);
    }
  });

  test('System Health Indicators', async () => {
    // Test data availability
    expect(testData.getSystemConfig()).toBeDefined();
    expect(testData.getAllValidUsers()).toBeDefined();
    expect(testData.getAllProducts()).toBeDefined();
    
    // Test API client configuration
    expect(apiClient).toBeDefined();
    
    console.log('✅ System components healthy');
  });
});

/**
 * API Regression Tests
 * Tests that should run after any API changes to ensure stability
 */
test.describe('API Regression Tests', () => {

  test('Core User Journey Still Works', async () => {
    // This test represents the most critical user path
    
    // Login -> Browse -> Add to Cart -> Checkout
    const user = testData.getUser('validUsers', 'standard');
    const loginResult = await apiClient.login(user.username, user.password);
    expect(loginResult.passed).toBe(true);
    
    const productsResult = await apiClient.getProducts();
    expect(productsResult.passed).toBe(true);
    
    const product = testData.getProduct('backpack');
    const addResult = await apiClient.addToCart(product.id, 1);
    expect(addResult.passed).toBe(true);
    
    const cartResult = await apiClient.getCart();
    expect(cartResult.data.itemCount).toBe(1);
    
    console.log('✅ Core user journey regression test passed');
  });

  test('All Valid Users Can Login', async () => {
    const validUsers = testData.getAllValidUsers();
    
    for (const [userKey, userData] of Object.entries(validUsers)) {
      const result = await apiClient.login(userData.username, userData.password);
      expect(result.passed, `User ${userKey} cannot login`).toBe(true);
      
      // Clear session for next user
      apiClient.clearSession();
    }
    
    console.log('✅ All valid users can login');
  });

  test('All Products Are Accessible', async () => {
    const products = testData.getAllProducts();
    
    for (const [productKey, productData] of Object.entries(products)) {
      const result = await apiClient.getProduct(productData.id);
      expect(result.passed, `Product ${productKey} not accessible`).toBe(true);
      expect(result.data.name).toBe(productData.name);
    }
    
    console.log('✅ All products accessible via API');
  });
});