# API Testing Implementation Guide

This guide explains how to implement and execute API tests for the SauceDemo comprehensive test plan using the API testing framework we've built.

## Overview

The API testing framework complements our existing UI tests by providing:

- **Authentication API Testing**: Login, session management, security validation
- **Product/Inventory API Testing**: Product catalog, sorting, individual product access  
- **Cart Management API Testing**: Add/remove items, quantity updates, calculations
- **Checkout API Testing**: Customer info, order summary, order completion
- **Integration Testing**: Complete user workflows across multiple APIs
- **Performance Testing**: Response time validation and load testing

## Quick Start

### 1. Run Simple API Examples

Start with basic API tests to verify the framework:

```bash
# Run simple API examples  
npx playwright test tests/api/simple-api-examples.spec.ts

# Run with detailed output
npx playwright test tests/api/simple-api-examples.spec.ts --reporter=list
```

### 2. Run Comprehensive API Tests

Execute the full API test suite:

```bash
# Run all API tests
npx playwright test tests/api/comprehensive-api-tests.spec.ts

# Run specific test categories
npx playwright test tests/api/comprehensive-api-tests.spec.ts --grep "Authentication"
npx playwright test tests/api/comprehensive-api-tests.spec.ts --grep "Cart Management"
```

### 3. Run API Health Check

Quick verification that all APIs are responding:

```bash
npx playwright test tests/api/simple-api-examples.spec.ts --grep "Health Check"
```

## Test Structure and Examples

### Authentication Testing

```typescript
// Example: Testing login with valid credentials
test('Successful authentication with valid credentials', async () => {
  const user = getValidUser('standard');
  
  const result = await apiClient.login(user.username, user.password);
  
  expect(result.passed).toBe(true);
  expect(result.statusCode).toBe(200);
  expect(result.data.user.username).toBe(user.username);
  expect(apiClient.isAuthenticated()).toBe(true);
});
```

### Product Catalog Testing

```typescript
// Example: Testing product retrieval and validation
test('Get all products with validation', async () => {
  const result = await apiClient.getProducts();
  
  expect(result.passed).toBe(true);
  expect(result.data.products.length).toBe(6);
  
  // Validate product structure
  result.data.products.forEach(product => {
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(typeof product.price).toBe('number');
  });
});
```

### Shopping Cart Testing

```typescript
// Example: Complete cart workflow
test('Shopping cart workflow', async () => {
  // Setup authentication
  await getAuthenticatedClient('standard');
  
  // Add item to cart
  const product = getProduct('backpack');
  const addResult = await apiClient.addToCart(product.id, 2);
  expect(addResult.passed).toBe(true);
  
  // Verify cart contents
  const cartResult = await apiClient.getCart();
  expect(cartResult.data.itemCount).toBe(2);
  expect(cartResult.data.totalAmount).toBe(product.price * 2);
});
```

### Integration Testing

```typescript
// Example: End-to-end API workflow
test('Complete shopping workflow', async () => {
  // 1. Login
  const user = getValidUser('standard');
  await apiClient.login(user.username, user.password);
  
  // 2. Browse products
  await apiClient.getProducts();
  
  // 3. Add items to cart
  const product = getProduct('backpack');
  await apiClient.addToCart(product.id, 1);
  
  // 4. Checkout
  const customer = getCustomer('customer1');
  await apiClient.submitCustomerInfo(customer.firstName, customer.lastName, customer.zipCode);
  
  // 5. Complete order
  const orderResult = await apiClient.completeOrder();
  expect(orderResult.data.status).toBe('completed');
});
```

## Integration with Test Plan Scenarios

The API tests implement specific scenarios from [comprehensive-saucedemo-test-plan.md](../specs/comprehensive-saucedemo-test-plan.md):

### Authentication Scenarios
- **API-AUTH-001**: Standard user login validation
- **API-AUTH-002**: Invalid credentials error handling
- **API-AUTH-003**: Locked user account handling
- **API-AUTH-004**: Session management and validation

### Product/Inventory Scenarios  
- **API-INV-001**: Product catalog retrieval
- **API-INV-002**: Product sorting functionality
- **API-INV-003**: Individual product access
- **API-INV-004**: Product data validation

### Cart Management Scenarios
- **API-CART-001**: Add items to cart
- **API-CART-002**: Update item quantities
- **API-CART-003**: Remove items from cart
- **API-CART-004**: Cart calculations validation

### Checkout Scenarios
- **API-CHECKOUT-001**: Customer information submission
- **API-CHECKOUT-002**: Order summary generation
- **API-CHECKOUT-003**: Order completion
- **API-CHECKOUT-004**: Order validation and cleanup

## Performance Testing

### Response Time Validation

```typescript
test('API performance benchmarks', async () => {
  const responseTimes = await apiClient.runPerformanceTest('getProducts', 5);
  
  const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  expect(avgTime).toBeLessThan(3000); // Average under 3 seconds
});
```

### Load Testing

```typescript
test('Concurrent request handling', async () => {
  const promises = Array(5).fill(0).map(() => apiClient.getProducts());
  const results = await Promise.all(promises);
  
  results.forEach(result => {
    expect(result.passed).toBe(true);
    expect(result.responseTime).toBeLessThan(5000);
  });
});
```

## Data-Driven Testing

The API tests leverage the centralized test data management system:

### Using Test Data

```typescript
// Get specific user data
const standardUser = getValidUser('standard');
const performanceUser = getValidUser('performance');

// Get product sets
const basicProducts = testData.getProductSet('basic'); 
const multipleItems = testData.getProductSet('multipleItems');

// Get test scenarios
const authScenarios = testData.getApiScenario('authentication', 'standardLogin');
const cartScenarios = testData.getApiScenario('cart', 'addMultipleItems');
```

### Dynamic Test Generation

```typescript
// Generate tests for all valid users
const validUsers = testData.getAllValidUsers();
Object.entries(validUsers).forEach(([userKey, userData]) => {
  test(`Login success for user: ${userKey}`, async () => {
    const result = await apiClient.login(userData.username, userData.password);
    expect(result.passed).toBe(true);
  });
});
```

## Running Combined UI and API Tests

### Full Test Suite Execution

```bash
# Run all tests (UI + API)
npm test

# Run only API tests
npm run test:api

# Run specific test categories
npm test -- --grep "Authentication"
npm test -- --grep "Cart"
npm test -- --grep "Performance"
```

### CI/CD Integration

```bash
# Run tests with coverage
npm run test:coverage

# Run tests in headless mode for CI
npm run test:ci

# Generate test reports
npm run test:report
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   ```bash
   # Verify test data
   npx playwright test tests/api/simple-api-examples.spec.ts --grep "Health Check"
   ```

2. **Network Connectivity**
   ```bash
   # Check if SauceDemo is accessible
   curl -I https://www.saucedemo.com
   ```

3. **Test Data Issues**
   ```bash
   # Validate test data structure
   node -e "console.log(require('./utils/testDataManager').testData.getAllValidUsers())"
   ```

### Debug Mode

```bash
# Run with debug output
PLAYWRIGHT_DEBUG=api npx playwright test tests/api/simple-api-examples.spec.ts

# Run with browser visible (for hybrid UI/API tests)
npx playwright test tests/api/comprehensive-api-tests.spec.ts --headed --debug
```

## Best Practices

### 1. Test Organization
- Group related API tests in describe blocks
- Use clear, descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Data Management
- Always use centralized test data
- Clean up test data after each test
- Use different data sets for different test scenarios

### 3. Error Handling
- Test both success and failure scenarios
- Validate error messages and status codes
- Test edge cases and boundary conditions

### 4. Performance Considerations
- Set appropriate timeout values
- Use performance benchmarks
- Monitor response time trends

### 5. Maintenance
- Keep API contracts up to date
- Review and update test scenarios regularly
- Monitor test execution metrics

## Extending the Framework

### Adding New API Endpoints

1. Update `test-data/api-endpoints.json` with new endpoint definitions
2. Add corresponding methods to `utils/apiClient.ts`
3. Create test scenarios in `test-data/api-test-scenarios.json`
4. Write tests in the appropriate test files

### Custom Validations

```typescript
// Add custom validation methods to apiClient.ts
async validateCustomRule(data: any): Promise<ValidationResult> {
  // Custom validation logic
  return {
    passed: true,
    field: 'customField',
    expected: 'expectedValue',
    actual: data.customField
  };
}
```

### Performance Monitoring

```typescript
// Add performance tracking
test('API response time tracking', async () => {
  const result = await apiClient.getProducts();
  
  // Log metrics for monitoring
  console.log(JSON.stringify({
    endpoint: 'GET /products',
    responseTime: result.responseTime,
    statusCode: result.statusCode,
    timestamp: new Date().toISOString()
  }));
});
```

## Integration with Jira

The API test results can be automatically reported to Jira issues:

```typescript
// Example: Update Jira issue with test results
test.afterEach(async ({ }, testInfo) => {
  if (testInfo.status === 'failed') {
    // Report failure to Jira defect DRVNDM-4
    const comment = `API Test Failed: ${testInfo.title}\nError: ${testInfo.error}`;
    // Add comment to Jira issue using Atlassian MCP tools
  }
});
```

This comprehensive API testing framework provides full coverage of the SauceDemo application's backend functionality, complementing the existing UI tests and providing a complete automation solution for the test plan.