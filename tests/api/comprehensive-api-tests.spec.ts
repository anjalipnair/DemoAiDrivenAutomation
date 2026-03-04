import { test, expect } from '@playwright/test';
import { 
  apiClient, 
  createApiClient, 
  getAuthenticatedClient, 
  TestResult, 
  ValidationResult 
} from '../../utils/apiClient';
import { testData, getValidUser, getInvalidUser, getProduct, getCustomer } from '../../utils/testDataManager';

/**
 * API Authentication Tests
 * Testing all authentication scenarios including valid/invalid credentials,
 * session management, and security validations
 */
test.describe('API Authentication Tests', () => {
  
  test.beforeEach(async () => {
    // Clear any existing session before each test
    apiClient.clearSession();
  });
  
  test('Successful authentication with valid credentials', async () => {
    const user = getValidUser('standard');
    
    const result = await apiClient.login(user.username, user.password);
    
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.responseTime).toBeLessThan(5000);
    expect(result.data).toHaveProperty('sessionToken');
    expect(result.data).toHaveProperty('user');
    expect(result.data.user).toHaveProperty('username', user.username);
    
    // Verify session token is stored
    expect(apiClient.isAuthenticated()).toBe(true);
    expect(apiClient.getSessionToken()).toBeTruthy();
    
    // Validate response structure
    expect(result.validations?.every(v => v.passed)).toBe(true);
  });
  
  test('Authentication failure with invalid credentials', async () => {
    const invalidUser = getInvalidUser('invalid');
    
    const result = await apiClient.login(invalidUser.username, invalidUser.password);
    
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain('Invalid username or password');
    expect(apiClient.isAuthenticated()).toBe(false);
  });
  
  test('Authentication failure with locked user', async () => {
    const lockedUser = getInvalidUser('locked');
    
    const result = await apiClient.login(lockedUser.username, lockedUser.password);
    
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain('locked out');
    expect(apiClient.isAuthenticated()).toBe(false);
  });
  
  test('Session validation after successful login', async () => {
    // First login
    const user = getValidUser('standard');
    const loginResult = await apiClient.login(user.username, user.password);
    expect(loginResult.passed).toBe(true);
    
    // Validate session
    const validateResult = await apiClient.validateSession();
    expect(validateResult.passed).toBe(true);
    expect(validateResult.statusCode).toBe(200);
  });
  
  test('Logout functionality', async () => {
    // Login first
    const user = getValidUser('standard');
    await apiClient.login(user.username, user.password);
    expect(apiClient.isAuthenticated()).toBe(true);
    
    // Logout
    const logoutResult = await apiClient.logout();
    expect(logoutResult.passed).toBe(true);
    expect(logoutResult.statusCode).toBe(200);
    expect(apiClient.isAuthenticated()).toBe(false);
    
    // Verify session is no longer valid
    const validateResult = await apiClient.validateSession();
    expect(validateResult.passed).toBe(false);
    expect(validateResult.statusCode).toBe(401);
  });
  
  // Data-driven test for all valid users
  const validUsers = testData.getAllValidUsers();
  Object.entries(validUsers).forEach(([userKey, userData]) => {
    test(`Login success for user: ${userKey}`, async () => {
      const result = await apiClient.login(userData.username, userData.password);
      
      expect(result.passed).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.data.user.username).toBe(userData.username);
    });
  });
});

/**
 * API Product/Inventory Tests
 * Testing product catalog retrieval, sorting, filtering, and individual product access
 */
test.describe('API Product/Inventory Tests', () => {
  
  test.beforeAll(async () => {
    // Some operations might require authentication
    await getAuthenticatedClient('standard');
  });
  
  test('Get all products', async () => {
    const result = await apiClient.getProducts();
    
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveProperty('products');
    expect(result.data).toHaveProperty('totalCount');
    expect(Array.isArray(result.data.products)).toBe(true);
    expect(result.data.products.length).toBe(6); // SauceDemo has 6 products
    expect(result.data.totalCount).toBe(6);
    
    // Validate response structure
    expect(result.validations?.every(v => v.passed)).toBe(true);
    
    // Verify first product has required fields
    const firstProduct = result.data.products[0];
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('price');
    expect(typeof firstProduct.price).toBe('number');
  });
  
  test('Product sorting by name ascending', async () => {
    const result = await apiClient.getProducts('name', 'asc');
    
    expect(result.passed).toBe(true);
    expect(result.data.products.length).toBe(6);
    
    // Verify products are sorted by name A-Z
    const productNames = result.data.products.map(p => p.name);
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);
  });
  
  test('Product sorting by price ascending', async () => {
    const result = await apiClient.getProducts('price', 'asc');
    
    expect(result.passed).toBe(true);
    
    // Verify products are sorted by price low to high
    const prices = result.data.products.map(p => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });
  
  test('Get individual product details', async () => {
    const productKey = 'backpack';
    const productData = getProduct(productKey);
    
    const result = await apiClient.getProduct(productData.id);
    
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveProperty('name', productData.name);
    expect(result.data).toHaveProperty('price', productData.price);
  });
  
  test('Get non-existent product returns 404', async () => {
    const result = await apiClient.getProduct('non-existent-product');
    
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.error).toBeTruthy();
  });
  
  // Performance test for product catalog
  test('Product catalog performance benchmark', async () => {
    const responseTimes = await apiClient.runPerformanceTest('getProducts', 5);
    
    const averageTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    
    console.log(`Product catalog - Average: ${averageTime}ms, Max: ${maxTime}ms`);
    
    expect(averageTime).toBeLessThan(3000); // Average under 3 seconds
    expect(maxTime).toBeLessThan(5000); // Max under 5 seconds
  });
});

/**
 * API Cart Management Tests
 * Testing cart operations including add, update, remove items and cart state management
 */
test.describe('API Cart Management Tests', () => {
  
  test.beforeEach(async () => {
    await getAuthenticatedClient('standard');
    // Clear cart before each test
    await apiClient.clearCart();
  });
  
  test('Get empty cart', async () => {
    const result = await apiClient.getCart();
    
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveProperty('cartId');
    expect(result.data).toHaveProperty('items');
    expect(result.data).toHaveProperty('itemCount', 0);
    expect(result.data).toHaveProperty('totalAmount', 0);
    expect(Array.isArray(result.data.items)).toBe(true);
    expect(result.data.items.length).toBe(0);
    
    // Validate response structure
    expect(result.validations?.every(v => v.passed)).toBe(true);
  });
  
  test('Add single item to cart', async () => {
    const product = getProduct('backpack');
    
    // Add product to cart
    const addResult = await apiClient.addToCart(product.id, 1);
    expect(addResult.passed).toBe(true);
    expect(addResult.statusCode).toBe(201);
    
    // Verify cart contents
    const cartResult = await apiClient.getCart();
    expect(cartResult.passed).toBe(true);
    expect(cartResult.data.itemCount).toBe(1);
    expect(cartResult.data.totalAmount).toBe(product.price);
    expect(cartResult.data.items[0]).toMatchObject({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      subtotal: product.price
    });
  });
  
  test('Add multiple different items to cart', async () => {
    const products = testData.getProductSet('multipleItems'); // backpack, bikeLight
    
    // Add multiple products
    for (const product of products) {
      const addResult = await apiClient.addToCart(product.id, 1);
      expect(addResult.passed).toBe(true);
    }
    
    // Verify final cart state
    const cartResult = await apiClient.getCart();
    expect(cartResult.passed).toBe(true);
    expect(cartResult.data.itemCount).toBe(products.length);
    
    const expectedTotal = products.reduce((sum, p) => sum + p.price, 0);
    expect(cartResult.data.totalAmount).toBeCloseTo(expectedTotal, 2);
  });
  
  test('Update item quantity in cart', async () => {
    const product = getProduct('backpack');
    
    // Add item first
    await apiClient.addToCart(product.id, 1);
    
    // Update quantity
    const updateResult = await apiClient.updateCartItem(product.id, 3);
    expect(updateResult.passed).toBe(true);
    
    // Verify updated cart
    const cartResult = await apiClient.getCart();
    expect(cartResult.data.itemCount).toBe(3);
    expect(cartResult.data.totalAmount).toBeCloseTo(product.price * 3, 2);
    expect(cartResult.data.items[0].quantity).toBe(3);
  });
  
  test('Remove item from cart', async () => {
    const products = testData.getProductSet('multipleItems');
    
    // Add multiple items
    for (const product of products) {
      await apiClient.addToCart(product.id, 1);
    }
    
    // Remove one item
    const removeResult = await apiClient.removeFromCart(products[0].id);
    expect(removeResult.passed).toBe(true);
    
    // Verify cart state
    const cartResult = await apiClient.getCart();
    expect(cartResult.data.itemCount).toBe(1);
    expect(cartResult.data.items.length).toBe(1);
    expect(cartResult.data.items[0].productId).toBe(products[1].id);
  });
  
  test('Clear entire cart', async () => {
    // Add multiple items first
    const products = testData.getProductSet('multipleItems');
    for (const product of products) {
      await apiClient.addToCart(product.id, 1);
    }
    
    // Clear cart
    const clearResult = await apiClient.clearCart();
    expect(clearResult.passed).toBe(true);
    
    // Verify empty cart
    const cartResult = await apiClient.getCart();
    expect(cartResult.data.itemCount).toBe(0);
    expect(cartResult.data.totalAmount).toBe(0);
    expect(cartResult.data.items.length).toBe(0);
  });
  
  test('Add non-existent product to cart', async () => {
    const result = await apiClient.addToCart('invalid-product-id', 1);
    
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.error).toContain('Product not found');
  });
  
  // Data consistency test
  test('Cart calculations are accurate', async () => {
    const products = [
      { product: getProduct('backpack'), quantity: 2 },
      { product: getProduct('bikeLight'), quantity: 3 }
    ];
    
    // Add items with specific quantities
    for (const item of products) {
      await apiClient.addToCart(item.product.id, item.quantity);
    }
    
    const cartResult = await apiClient.getCart();
    
    // Verify item count
    const expectedItemCount = products.reduce((sum, item) => sum + item.quantity, 0);
    expect(cartResult.data.itemCount).toBe(expectedItemCount);
    
    // Verify total amount
    const expectedTotal = products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    expect(cartResult.data.totalAmount).toBeCloseTo(expectedTotal, 2);
    
    // Verify individual item subtotals
    cartResult.data.items.forEach(cartItem => {
      const expectedSubtotal = cartItem.price * cartItem.quantity;
      expect(cartItem.subtotal).toBeCloseTo(expectedSubtotal, 2);
    });
  });
});

/**
 * API Checkout Tests  
 * Testing complete checkout flow including customer info, order summary, and completion
 */
test.describe('API Checkout Tests', () => {
  
  test.beforeEach(async () => {
    await getAuthenticatedClient('standard');
    await apiClient.clearCart();
  });
  
  test('Submit valid customer information', async () => {
    // Setup: Add item to cart first
    const product = getProduct('backpack');
    await apiClient.addToCart(product.id, 1);
    
    // Submit customer info
    const customer = getCustomer('customer1');
    const result = await apiClient.submitCustomerInfo(
      customer.firstName,
      customer.lastName,
      customer.zipCode
    );
    
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
  });
  
  test('Customer info validation - missing fields', async () => {
    // Setup cart
    await apiClient.addToCart(getProduct('backpack').id, 1);
    
    // Test missing first name
    const result1 = await apiClient.submitCustomerInfo('', 'Doe', '12345');
    expect(result1.passed).toBe(false);
    expect(result1.statusCode).toBe(400);
    expect(result1.error).toContain('First Name is required');
    
    // Test missing last name  
    const result2 = await apiClient.submitCustomerInfo('John', '', '12345');
    expect(result2.passed).toBe(false);
    expect(result2.error).toContain('Last Name is required');
    
    // Test missing postal code
    const result3 = await apiClient.submitCustomerInfo('John', 'Doe', '');
    expect(result3.passed).toBe(false);
    expect(result3.error).toContain('Postal Code is required');
  });
  
  test('Get order summary with tax calculations', async () => {
    // Setup: Add items and submit customer info
    const product = getProduct('backpack');
    await apiClient.addToCart(product.id, 2);
    
    const customer = getCustomer('customer1');
    await apiClient.submitCustomerInfo(customer.firstName, customer.lastName, customer.zipCode);
    
    // Get order summary
    const result = await apiClient.getOrderSummary();
    
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveProperty('items');
    expect(result.data).toHaveProperty('subtotal');
    expect(result.data).toHaveProperty('tax');
    expect(result.data).toHaveProperty('shipping');
    expect(result.data).toHaveProperty('total');
    expect(result.data).toHaveProperty('paymentInfo');
    expect(result.data).toHaveProperty('shippingInfo');
    
    // Verify calculations
    const expectedSubtotal = product.price * 2;
    expect(result.data.subtotal).toBeCloseTo(expectedSubtotal, 2);
    
    // Verify total calculation (subtotal + tax + shipping)
    const calculatedTotal = result.data.subtotal + result.data.tax + result.data.shipping;
    expect(result.data.total).toBeCloseTo(calculatedTotal, 2);
    
    // Validate response structure
    expect(result.validations?.every(v => v.passed)).toBe(true);
  });
  
  test('Complete order successfully', async () => {
    // Setup complete checkout flow
    const product = getProduct('backpack');
    await apiClient.addToCart(product.id, 1);
    
    const customer = getCustomer('customer1');
    await apiClient.submitCustomerInfo(customer.firstName, customer.lastName, customer.zipCode);
    
    // Complete order
    const result = await apiClient.completeOrder();
    
    expect(result.passed).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.data).toHaveProperty('orderId');
    expect(result.data).toHaveProperty('status');
    expect(result.data).toHaveProperty('confirmationMessage');
    expect(result.data.status).toBe('completed');
    
    // Verify cart is cleared after order completion
    const cartResult = await apiClient.getCart();
    expect(cartResult.data.itemCount).toBe(0);
  });
  
  test('Prevent checkout with empty cart', async () => {
    const customer = getCustomer('customer1');
    const result = await apiClient.submitCustomerInfo(
      customer.firstName,
      customer.lastName,
      customer.zipCode
    );
    
    expect(result.passed).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toContain('Cart is empty');
  });
});

/**
 * API Integration Tests
 * Testing complete user workflows that span multiple API endpoints
 */
test.describe('API Integration Tests', () => {
  
  test('Complete shopping workflow - login to order completion', async () => {
    // Step 1: Login
    const user = getValidUser('standard');
    const loginResult = await apiClient.login(user.username, user.password);
    expect(loginResult.passed).toBe(true);
    
    // Step 2: Browse products
    const productsResult = await apiClient.getProducts();
    expect(productsResult.passed).toBe(true);
    
    // Step 3: Add items to cart
    const selectedProducts = testData.getProductSet('multipleItems');
    for (const product of selectedProducts) {
      const addResult = await apiClient.addToCart(product.id, 1);
      expect(addResult.passed).toBe(true);
    }
    
    // Step 4: Review cart
    const cartResult = await apiClient.getCart();
    expect(cartResult.passed).toBe(true);
    expect(cartResult.data.itemCount).toBe(selectedProducts.length);
    
    // Step 5: Submit customer info
    const customer = getCustomer('customer1');
    const customerResult = await apiClient.submitCustomerInfo(
      customer.firstName,
      customer.lastName,
      customer.zipCode
    );
    expect(customerResult.passed).toBe(true);
    
    // Step 6: Review order summary
    const summaryResult = await apiClient.getOrderSummary();
    expect(summaryResult.passed).toBe(true);
    
    // Step 7: Complete order
    const orderResult = await apiClient.completeOrder();
    expect(orderResult.passed).toBe(true);
    expect(orderResult.data.status).toBe('completed');
    
    // Step 8: Verify cart is empty
    const finalCartResult = await apiClient.getCart();
    expect(finalCartResult.data.itemCount).toBe(0);
    
    console.log(`Order completed: ${orderResult.data.orderId}`);
  });
  
  test('Session management across multiple operations', async () => {
    // Login and perform multiple operations to test session persistence
    const user = getValidUser('standard');
    await apiClient.login(user.username, user.password);
    
    const operations = [
      () => apiClient.getProducts(),
      () => apiClient.getCart(),
      () => apiClient.addToCart(getProduct('backpack').id, 1),
      () => apiClient.getCart(),
      () => apiClient.validateSession()
    ];
    
    for (const operation of operations) {
      const result = await operation();
      expect(result.passed).toBe(true);
      expect(apiClient.isAuthenticated()).toBe(true);
    }
  });
  
  // Data-driven integration test
  const testDataSet = testData.getTestDataSet('smoke');
  testDataSet.users.forEach(userKey => {
    testDataSet.products.forEach(productKey => {
      test(`Smoke test: ${userKey} user with ${productKey} product`, async () => {
        // Login
        const user = testData.getUser('validUsers', userKey);
        const loginResult = await apiClient.login(user.username, user.password);
        expect(loginResult.passed).toBe(true);
        
        // Add product
        const product = getProduct(productKey);
        const addResult = await apiClient.addToCart(product.id, 1);
        expect(addResult.passed).toBe(true);
        
        // Verify cart
        const cartResult = await apiClient.getCart();
        expect(cartResult.passed).toBe(true);
        expect(cartResult.data.itemCount).toBe(1);
        
        // Cleanup
        await apiClient.clearCart();
        await apiClient.logout();
      });
    });
  });
});

/**
 * API Performance Tests
 * Testing response times, load handling, and performance benchmarks
 */
test.describe('API Performance Tests', () => {
  
  test('Authentication performance benchmark', async () => {
    const iterations = 5;
    const responseTimes = await apiClient.runPerformanceTest('login', iterations);
    
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const maxTime = Math.max(...responseTimes);
    const minTime = Math.min(...responseTimes);
    
    console.log(`Authentication Performance:
      Average: ${avgTime}ms
      Min: ${minTime}ms  
      Max: ${maxTime}ms`);
    
    // Performance assertions
    expect(avgTime).toBeLessThan(2000); // Average under 2 seconds
    expect(maxTime).toBeLessThan(5000); // Max under 5 seconds
    
    // Verify all requests succeeded
    expect(responseTimes.length).toBe(iterations);
    responseTimes.forEach(time => {
      expect(time).toBeGreaterThan(0);
    });
  });
  
  test('Cart operations performance', async () => {
    // Setup authenticated session
    await getAuthenticatedClient('standard');
    
    const operations = [
      { name: 'getCart', fn: () => apiClient.getCart() },
      { name: 'addToCart', fn: () => apiClient.addToCart(getProduct('backpack').id, 1) },
      { name: 'updateCart', fn: () => apiClient.updateCartItem(getProduct('backpack').id, 2) },
      { name: 'removeFromCart', fn: () => apiClient.removeFromCart(getProduct('backpack').id) }
    ];
    
    for (const operation of operations) {
      const startTime = Date.now();
      const result = await operation.fn();
      const responseTime = Date.now() - startTime;
      
      expect(result.passed).toBe(true);
      expect(responseTime).toBeLessThan(3000);
      
      console.log(`${operation.name}: ${responseTime}ms`);
    }
  });
  
  test('Concurrent request handling', async () => {
    // Test multiple simultaneous requests
    const client1 = createApiClient();
    const client2 = createApiClient();
    
    const user = getValidUser('standard');
    
    // Login with both clients simultaneously
    const loginPromises = [
      client1.login(user.username, user.password),
      client2.login(user.username, user.password)
    ];
    
    const loginResults = await Promise.all(loginPromises);
    
    loginResults.forEach(result => {
      expect(result.passed).toBe(true);
      expect(result.statusCode).toBe(200);
    });
    
    // Perform concurrent operations
    const operationPromises = [
      client1.getProducts(),
      client2.getProducts(),
      client1.getCart(),
      client2.getCart()
    ];
    
    const operationResults = await Promise.all(operationPromises);
    
    operationResults.forEach(result => {
      expect(result.passed).toBe(true);
    });
  });
});