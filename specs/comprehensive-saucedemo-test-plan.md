# Comprehensive SauceDemo Functional Test Plan

## Test Data Management Strategy

### Overview
This test plan implements a robust, centralized test data management approach to ensure maintainability, reusability, and consistency across all test scenarios. All test data is externalized from test logic and organized in structured JSON files.

### Test Data Structure

#### 📁 **test-data/** Directory Structure
```
test-data/
├── users.json          # Authentication credentials and user accounts
├── products.json       # Product catalog, pricing, and selectors  
├── checkout.json       # Customer information and checkout data
├── system.json         # URLs, selectors, timeouts, error messages
└── environments.json   # Environment configs and test data sets
```

#### 🔧 **utils/testDataManager.ts**
Centralized TypeScript utility providing:
- **Type-safe access** to all test data
- **Caching mechanism** for performance
- **Environment-specific configurations** 
- **Data-driven testing support**
- **Consistent API** across all test files

### Test Data Categories

#### 🔐 **Authentication Data** (`users.json`)
- **Valid Users**: `standard_user`, `performance_glitch_user`, `problem_user`, `error_user`, `visual_user`
- **Invalid Users**: `locked_out_user`, invalid credentials, wrong passwords
- **Empty Field scenarios**: Missing username, password, or both
- **Expected error messages** for each invalid scenario

#### 🛒 **Product Data** (`products.json`)  
- **Complete product catalog**: Names, prices, descriptions, selectors
- **Sorting configurations**: Name A-Z/Z-A, Price low-high/high-low
- **Test data sets**: Single item, multiple items, expensive/cheap items
- **Dynamic selectors**: Add/remove buttons for each product

#### 👤 **Customer Data** (`checkout.json`)
- **Valid customers**: Multiple customer profiles for variety
- **Invalid scenarios**: Missing required fields validation
- **Payment info**: Default payment method configuration
- **Shipping info**: Standard delivery options
- **Success messages**: Order completion confirmations

#### ⚙️ **System Configuration** (`system.json`)
- **URLs**: All application endpoints and paths
- **Selectors**: Page element locators organized by functionality
- **Timeouts**: Different timeout values for various operations
- **Expected texts**: Page titles, labels, and static content
- **Error messages**: Complete error message catalog

#### 🌍 **Environment Configuration** (`environments.json`)
- **Environment settings**: Development, staging, production configs
- **Test data sets**: Smoke, regression, full suite configurations
- **Browser configs**: Chrome, Firefox, Safari, mobile settings
- **Performance settings**: Timeouts, retries, execution speed

### Usage Examples

#### Basic Usage
```typescript
import { testData, getValidUser, getProduct } from '../utils/testDataManager';

// Get user credentials
const user = getValidUser('standard');  
await page.fill('[data-test="username"]', user.username);

// Get product information
const product = getProduct('backpack');
await page.click(product.addToCartSelector);
```

#### Data-Driven Testing
```typescript
// Test all valid users automatically
const validUsers = testData.getAllValidUsers();
Object.entries(validUsers).forEach(([userKey, userData]) => {
  test(`Login success for ${userKey}`, async ({ page }) => {
    // Test implementation using userData
  });
});
```

#### Environment-Specific Testing
```typescript
// Load environment-specific configuration
const env = testData.getEnvironment(process.env.TEST_ENV || 'production');
await page.goto(env.baseUrl);
```

### Benefits

✅ **Maintainability**: Single source of truth for all test data  
✅ **Reusability**: Shared data across multiple test files  
✅ **Consistency**: Standardized data formats and access patterns  
✅ **Flexibility**: Easy environment switching and data variations  
✅ **Type Safety**: TypeScript interfaces prevent runtime errors  
✅ **Performance**: Caching mechanism reduces file I/O operations  
✅ **Scalability**: Easy to extend with new data categories  
✅ **Data-Driven Testing**: Automatic test generation from data sets  

---

## Application Overview

This test plan provides complete functional test coverage for SauceDemo.com e-commerce application, covering login/session management and end-to-end shopping cart and checkout functionality. Based on exploration of the live application, this plan addresses both user stories DRVNDM-2 (Login and Session Validation) and DRVNDM-3 (Cart and Checkout Flow Validation) with comprehensive scenarios including happy paths, edge cases, and error conditions.

## Test Scenarios

### 1. Authentication and Session Management

**Seed:** `tests/seed.spec.ts`

#### 1.1. Successful Login with Standard User

**File:** `tests/auth/successful-login.spec.ts`  
**Data Source:** `testData.getUser('validUsers', 'standard')`

**Steps:**
  1. Navigate to `testData.getBaseUrl()`
    - expect: Login page displays with username and password fields
    - expect: Page title shows `testData.getExpectedText('pageTitle')`
    - expect: Username and password input fields are visible and enabled
  2. Enter `user.username` in username field using `getSelector('login', 'username')`
    - expect: Username field accepts input
    - expect: Text is displayed in username field
  3. Enter `user.password` in password field using `getSelector('login', 'password')`
    - expect: Password field accepts input
    - expect: Text is masked/hidden in password field
  4. Click Login button using `getSelector('login', 'loginButton')`
    - expect: User is redirected to `testData.getUrl('inventory')`
    - expect: URL changes to /inventory.html
    - expect: Product catalog is displayed
    - expect: Menu button is visible in header

#### 1.2. Invalid Username Login Attempt

**File:** `tests/auth/invalid-username.spec.ts`  
**Data Source:** `testData.getUser('invalidUsers', 'invalid')`

**Steps:**
  1. Navigate to login page
    - expect: Login form is displayed
  2. Enter `user.username` in username field
    - expect: Invalid username is accepted in field
  3. Enter `user.password` in password field
    - expect: Password is entered correctly
  4. Click Login button
    - expect: Error message displayed: `user.expectedError`
    - expect: User remains on login page
    - expect: Login form is still visible

#### 1.3. Invalid Password Login Attempt

**File:** `tests/auth/invalid-password.spec.ts`  
**Data Source:** `testData.getUser('invalidUsers', 'wrongPassword')`

**Steps:**
  1. Navigate to login page
    - expect: Login form is displayed
  2. Enter `user.username` in username field
    - expect: Valid username is entered
  3. Enter `user.password` in password field
    - expect: Invalid password is entered
  4. Click Login button
    - expect: Error message displayed: `testData.getErrorMessage('invalidCredentials')`
    - expect: User remains on login page
    - expect: Error can be dismissed

#### 1.4. Locked Out User Login Attempt

**File:** `tests/auth/locked-user.spec.ts`  
**Data Source:** `testData.getUser('invalidUsers', 'locked')`

**Steps:**
  1. Navigate to login page
    - expect: Login form is displayed
  2. Enter `user.username` in username field
    - expect: Locked username is entered
  3. Enter `user.password` in password field
    - expect: Correct password is entered
  4. Click Login button
    - expect: Error message displayed: `user.expectedError`
    - expect: User cannot access the application
    - expect: Error message includes appropriate warning

#### 1.5. Empty Fields Validation

**File:** `tests/auth/empty-fields.spec.ts`  
**Data Sources:** Multiple scenarios from `testData.getUser('emptyFields', ...)`

**Steps:**
  1. Navigate to login page - **Test Data:** `emptyFields.noUsername`
    - expect: Login form is displayed
  2. Leave username field empty and click Login
    - expect: Error message displayed: `testData.getErrorMessage('usernameRequired')`
    - expect: User remains on login page
  3. Enter valid username and leave password empty, click Login - **Test Data:** `emptyFields.noPassword`
    - expect: Error message displayed: `testData.getErrorMessage('passwordRequired')`
    - expect: User remains on login page
  4. Leave both fields empty and click Login - **Test Data:** `emptyFields.bothEmpty`
    - expect: Error message displayed about required fields
    - expect: User cannot proceed without credentials

#### 1.6. Successful Logout Process

**File:** `tests/auth/logout.spec.ts`

**Steps:**
  1. Login with valid credentials (standard_user/secret_sauce)
    - expect: User successfully reaches inventory page
  2. Click hamburger menu button
    - expect: Side menu opens with navigation options
    - expect: Logout option is visible and clickable
  3. Click Logout option
    - expect: User is redirected to login page
    - expect: URL changes back to base URL
    - expect: Session is terminated
    - expect: Login form is displayed again
  4. Try to navigate back to /inventory.html directly
    - expect: User is redirected to login page
    - expect: Cannot access protected pages without authentication

### 2. Shopping Cart and Checkout Flow

**Seed:** `tests/seed.spec.ts`

#### 2.1. Add Single Item to Cart

**File:** `tests/cart/add-single-item.spec.ts`

**Steps:**
  1. Login and navigate to inventory page
    - expect: 6 products are displayed
    - expect: Each product has Add to cart button
    - expect: Cart icon shows no items initially
  2. Click 'Add to cart' for Sauce Labs Backpack
    - expect: Cart icon shows '1' item
    - expect: Add to cart button changes to 'Remove' button
    - expect: Product remains displayed in inventory
  3. Click cart icon to view cart
    - expect: Cart page displays with item
    - expect: Sauce Labs Backpack is listed with quantity 1
    - expect: Price shows $29.99
    - expect: Continue Shopping and Checkout buttons are visible

#### 2.2. Add Multiple Items to Cart

**File:** `tests/cart/add-multiple-items.spec.ts`

**Steps:**
  1. Login and navigate to inventory page
    - expect: Product inventory is displayed
  2. Add Sauce Labs Backpack to cart
    - expect: Cart shows 1 item
    - expect: Backpack button shows Remove
  3. Add Sauce Labs Bike Light to cart
    - expect: Cart shows 2 items
    - expect: Both items have Remove buttons
    - expect: Cart count increases to 2
  4. View cart page
    - expect: Both items are listed in cart
    - expect: Quantities are correct
    - expect: Individual prices are displayed
    - expect: Continue Shopping and Checkout options available

#### 2.3. Remove Items from Cart

**File:** `tests/cart/remove-items.spec.ts`

**Steps:**
  1. Add multiple items to cart
    - expect: Cart contains multiple items
  2. Click Remove button for first product using `product.removeSelector`
    - expect: Cart count decreases
    - expect: Remove button changes back to Add to cart
    - expect: Item is removed from cart
  3. Navigate to cart page and click Remove for remaining item
    - expect: Item is removed from cart display
    - expect: Cart becomes empty
    - expect: Cart count shows 0 or disappears

#### 2.4. Product Sorting Functionality

**File:** `tests/inventory/product-sorting.spec.ts`  
**Data Source:** `testData.getSortingOption(...)` for all sorting methods

**Steps:**
  1. Login and view inventory page
    - expect: Products displayed in default order (A to Z)
    - expect: Sorting dropdown shows `sortingOption.label` selected
  2. Select each sorting option from `testData.getSortingOption()`:
    - **Name (Z to A)**: `sortingOption.expectedOrder` validation
    - **Price (low to high)**: Products ordered by `product.price` ascending
    - **Price (high to low)**: Products ordered by `product.price` descending
  3. Verify product order matches `sortingOption.expectedOrder` for each sort type

#### 2.5. Complete Checkout Process with Valid Information

**File:** `tests/checkout/successful-checkout.spec.ts`  
**Data Sources:** 
- Products: `testData.getProductSet('singleItem')`
- Customer: `testData.getCustomer('validCustomers', 'customer1')`
- Payment: `testData.getPaymentInfo()`
- Shipping: `testData.getShippingInfo()`

**File:** `tests/checkout/successful-checkout.spec.ts`

**Steps:**
  1. Add items to cart and proceed to checkout
    - expect: Cart contains items
    - expect: Checkout button is clickable
  2. Click Checkout button
    - expect: Redirected to checkout information page
    - expect: URL changes to /checkout-step-one.html
    - expect: Form with First Name, Last Name, Zip Code fields is displayed
    - expect: Continue and Cancel buttons are visible
  3. Enter 'John' in First Name field
    - expect: First Name field accepts input
  4. Enter 'Doe' in Last Name field
    - expect: Last Name field accepts input
  5. Enter '12345' in Zip/Postal Code field
    - expect: Zip Code field accepts input
  6. Click Continue button
    - expect: Redirected to checkout overview page
    - expect: URL changes to /checkout-step-two.html
    - expect: Order summary displays items with quantities
    - expect: Payment info shows SauceCard #31337
    - expect: Shipping info shows Free Pony Express Delivery
    - expect: Tax calculation is displayed
    - expect: Total price is calculated correctly
  7. Click Finish button
    - expect: Redirected to order confirmation page
    - expect: URL changes to /checkout-complete.html
    - expect: Success message 'Thank you for your order!' is displayed
    - expect: Confirmation details about dispatch are shown
    - expect: Back Home button is available
  8. Click Back Home button
    - expect: Returned to inventory page
    - expect: Cart is reset to empty
    - expect: Order process is complete

#### 2.6. Checkout Form Validation

**File:** `tests/checkout/form-validation.spec.ts`

**Steps:**
  1. Proceed to checkout with items in cart
    - expect: Checkout information form is displayed
  2. Leave First Name empty and click Continue
    - expect: Error message displayed: 'Error: First Name is required'
    - expect: User remains on checkout step one
    - expect: Form validation prevents progression
  3. Enter First Name, leave Last Name empty, and click Continue
    - expect: Error message displayed: 'Error: Last Name is required'
    - expect: Cannot proceed with incomplete information
  4. Enter First Name and Last Name, leave Zip Code empty, and click Continue
    - expect: Error message displayed: 'Error: Postal Code is required'
    - expect: All fields are required for checkout
  5. Fill all required fields correctly and click Continue
    - expect: Validation passes
    - expect: User proceeds to checkout overview
    - expect: No error messages displayed

#### 2.7. Checkout Navigation and Cancel Options

**File:** `tests/checkout/navigation-cancel.spec.ts`

**Steps:**
  1. Proceed to checkout information page
    - expect: Checkout form is displayed with Cancel option
  2. Click Cancel button on checkout information page
    - expect: User returns to cart page
    - expect: Cart items are preserved
    - expect: Can resume checkout process
  3. Proceed through checkout to overview page
    - expect: Checkout overview is displayed
  4. Click Cancel button on checkout overview page
    - expect: User returns to inventory page
    - expect: Cart items remain in cart
    - expect: Checkout can be restarted
  5. Use browser back button during checkout process
    - expect: Navigation behaves correctly
    - expect: No data loss occurs
    - expect: User can complete checkout after navigating back

#### 2.8. Empty Cart Checkout Attempt

**File:** `tests/checkout/empty-cart.spec.ts`

**Steps:**
  1. Navigate to cart page with no items
    - expect: Cart page shows no items
    - expect: Checkout button behavior with empty cart
  2. Attempt to proceed with checkout on empty cart
    - expect: Appropriate handling of empty cart scenario
    - expect: User guidance to add items before checkout

### 3. API Testing and Backend Validation

The API testing framework provides comprehensive backend validation to complement the UI tests. All API tests leverage the same centralized test data management system for consistency and maintainability.

**API Client:** `utils/apiClient.ts` - TypeScript API client with built-in validation, error handling, and performance monitoring  
**Test Data:** Leverages existing `test-data/` JSON files plus new `api-endpoints.json` and `api-test-scenarios.json`  
**Framework Features:** Authentication management, automatic validation, performance benchmarks, comprehensive error handling

#### 3.1. Authentication API Validation

**Files:** `tests/api/comprehensive-api-tests.spec.ts`, `tests/api/simple-api-examples.spec.ts`  
**Data Source:** `testData.getUser('validUsers', 'standard')`, `testData.getApiScenario('authentication', 'standardLogin')`

**Test Scenarios:**

**API-AUTH-001: Standard User Authentication**
```typescript
const user = getValidUser('standard');
const result = await apiClient.login(user.username, user.password);
```
**Steps:**
  1. Send POST request to `/api/auth/login` with valid credentials
    - expect: HTTP 200 response status
    - expect: Response contains `sessionToken` and `user` object  
    - expect: Response time under 5 seconds
    - expect: Session token is valid JWT format
  2. Validate response structure matches API schema
    - expect: All required fields present in response
    - expect: User object contains correct username
    - expect: Session token can be used for subsequent requests

**API-AUTH-002: Invalid Credentials Handling**
```typescript
const invalidUser = getInvalidUser('invalid');
const result = await apiClient.login(invalidUser.username, invalidUser.password);
```
**Steps:**
  1. Send POST request with invalid username/password
    - expect: HTTP 401 Unauthorized response
    - expect: Error message: "Invalid username or password"
    - expect: No session token returned
    - expect: Response time under 3 seconds

**API-AUTH-003: Locked User Account Validation**
```typescript
const lockedUser = getInvalidUser('locked');
const result = await apiClient.login(lockedUser.username, lockedUser.password);
```
**Steps:**
  1. Attempt login with locked out user credentials
    - expect: HTTP 401 Unauthorized response  
    - expect: Error message contains "locked out" text
    - expect: Account lockout is properly enforced
    - expect: Security measures are in place

**API-AUTH-004: Session Management and Validation**
```typescript
await apiClient.login(user.username, user.password);
const sessionResult = await apiClient.validateSession();
```
**Steps:**
  1. Login and obtain session token
  2. Validate active session status
    - expect: HTTP 200 response for valid session
    - expect: Session details returned correctly
  3. Test session logout functionality
    - expect: Session invalidated after logout
    - expect: Subsequent requests with old token fail

#### 3.2. Product/Inventory API Validation

**Files:** `tests/api/comprehensive-api-tests.spec.ts`  
**Data Source:** `testData.getProduct('backpack')`, `testData.getApiScenario('inventory', 'getAllProducts')`

**Test Scenarios:**

**API-INV-001: Product Catalog Retrieval**
```typescript
const result = await apiClient.getProducts();
```
**Steps:**
  1. Send GET request to `/api/products`
    - expect: HTTP 200 response status
    - expect: Response contains array of 6 products
    - expect: Each product has required fields (id, name, price)
    - expect: Response time under 3 seconds
  2. Validate product data integrity
    - expect: All product prices are positive numbers
    - expect: Product IDs are unique
    - expect: Product names match expected catalog

**API-INV-002: Product Sorting Functionality**
```typescript
const result = await apiClient.getProducts('price', 'asc');
```
**Steps:**
  1. Request products sorted by price ascending
    - expect: HTTP 200 response
    - expect: Products returned in correct price order (low to high)
  2. Request products sorted by name alphabetically  
    - expect: Products returned in alphabetical order (A-Z)
  3. Validate sorting accuracy
    - expect: All sorting options work correctly
    - expect: Product data remains intact during sorting

**API-INV-003: Individual Product Access**
```typescript
const product = getProduct('backpack');
const result = await apiClient.getProduct(product.id);
```
**Steps:**
  1. Request specific product by ID
    - expect: HTTP 200 response
    - expect: Product details match expected data
    - expect: Response contains name, price, description
  2. Test non-existent product handling
    - expect: HTTP 404 response for invalid product ID
    - expect: Appropriate error message returned

#### 3.3. Shopping Cart API Validation  

**Files:** `tests/api/comprehensive-api-tests.spec.ts`  
**Data Source:** `testData.getProductSet('multipleItems')`, `testData.getApiScenario('cart', 'addMultipleItems')`

**Test Scenarios:**

**API-CART-001: Add Items to Cart**
```typescript
const product = getProduct('backpack');
const result = await apiClient.addToCart(product.id, 2);
```
**Steps:**
  1. Add single item to empty cart
    - expect: HTTP 201 Created response
    - expect: Item successfully added with correct quantity
    - expect: Cart total calculated correctly
  2. Add multiple different items
    - expect: All items added successfully
    - expect: Cart item count accurate
    - expect: Total amount reflects all items

**API-CART-002: Update Cart Items**
```typescript
await apiClient.addToCart(product.id, 1);
const result = await apiClient.updateCartItem(product.id, 3);
```
**Steps:**
  1. Update existing item quantity
    - expect: HTTP 200 response
    - expect: Quantity updated correctly
    - expect: Cart totals recalculated
  2. Validate quantity constraints
    - expect: Positive quantities only
    - expect: Maximum quantity limits enforced

**API-CART-003: Remove Items from Cart**
```typescript  
const result = await apiClient.removeFromCart(product.id);
```
**Steps:**
  1. Remove specific item from cart
    - expect: HTTP 200 response
    - expect: Item removed completely
    - expect: Cart totals updated correctly
  2. Clear entire cart
    - expect: All items removed
    - expect: Cart returned to empty state

**API-CART-004: Cart Calculations Validation**
```typescript
// Add items with different quantities and verify calculations
const products = [
  { product: getProduct('backpack'), quantity: 2 },
  { product: getProduct('bikeLight'), quantity: 3 }
];
```
**Steps:**
  1. Add multiple items with various quantities
  2. Validate mathematical accuracy
    - expect: Item subtotals = price × quantity
    - expect: Cart total = sum of all subtotals
    - expect: Item count = sum of all quantities
    - expect: Decimal precision maintained

#### 3.4. Checkout API Validation

**Files:** `tests/api/comprehensive-api-tests.spec.ts`  
**Data Source:** `testData.getCustomer('customer1')`, `testData.getApiScenario('checkout', 'completeOrder')`

**Test Scenarios:**

**API-CHECKOUT-001: Customer Information Submission**
```typescript
const customer = getCustomer('customer1');
const result = await apiClient.submitCustomerInfo(customer.firstName, customer.lastName, customer.zipCode);
```
**Steps:**
  1. Submit valid customer information
    - expect: HTTP 200 response
    - expect: Customer info accepted and stored
    - expect: Checkout can proceed to next step
  2. Validate required field enforcement
    - expect: Missing firstName returns HTTP 400
    - expect: Missing lastName returns HTTP 400  
    - expect: Missing zipCode returns HTTP 400
    - expect: Appropriate error messages for each missing field

**API-CHECKOUT-002: Order Summary Generation**
```typescript
await apiClient.submitCustomerInfo(customer.firstName, customer.lastName, customer.zipCode);
const result = await apiClient.getOrderSummary();
```
**Steps:**
  1. Generate order summary after customer info submission
    - expect: HTTP 200 response
    - expect: Summary includes all cart items
    - expect: Tax calculation applied correctly
    - expect: Shipping costs included
    - expect: Final total calculated accurately
  2. Validate summary components
    - expect: Subtotal = sum of item costs
    - expect: Tax percentage applied correctly
    - expect: Total = subtotal + tax + shipping
    - expect: Payment and shipping info displayed

**API-CHECKOUT-003: Order Completion**
```typescript
const result = await apiClient.completeOrder();
```
**Steps:**
  1. Complete order after all required information provided
    - expect: HTTP 200 response
    - expect: Order ID generated and returned
    - expect: Order status marked as "completed"
    - expect: Confirmation message provided
  2. Validate post-completion state
    - expect: Cart cleared after successful order
    - expect: Order details stored properly
    - expect: Customer can place new orders

**API-CHECKOUT-004: Checkout Error Handling**
```typescript
// Attempt checkout with empty cart
const result = await apiClient.submitCustomerInfo(customer.firstName, customer.lastName, customer.zipCode);
```
**Steps:**
  1. Attempt checkout with empty cart
    - expect: HTTP 400 Bad Request response
    - expect: Error message indicates cart is empty
    - expect: Checkout process prevented
  2. Test incomplete checkout flows
    - expect: Proper handling of missing customer info
    - expect: Validation at each checkout step

#### 3.5. API Integration and End-to-End Testing

**Files:** `tests/api/comprehensive-api-tests.spec.ts` - Integration test suite  
**Data Source:** Multiple test data sources combined for complete workflows

**Test Scenarios:**

**API-E2E-001: Complete Shopping Workflow**  
```typescript
// Complete user journey from login to order completion via API
test('Complete shopping workflow - login to order completion', async () => {
  // 8-step process testing entire backend flow
});
```
**Steps:**
  1. User authentication via API
  2. Product catalog browsing
  3. Add multiple items to cart
  4. Review and modify cart contents
  5. Submit customer information
  6. Review order summary
  7. Complete order placement
  8. Verify post-order state (empty cart)
  
**Validation Points:**
  - expect: Each API call succeeds with proper status codes
  - expect: Data consistency maintained throughout workflow  
  - expect: Session persistence across multiple operations
  - expect: Cart state accurately tracked
  - expect: Order completion resets system state properly

**API-E2E-002: Session Management Across Operations**
```typescript  
// Test session persistence and authentication across multiple API calls
```
**Steps:**
  1. Login and establish session
  2. Perform 5+ different API operations without re-authentication
  3. Validate session remains active
  4. Test session timeout handling
  - expect: Session token remains valid for duration of test
  - expect: All operations succeed with same session
  - expect: Proper cleanup on session expiry

**API-E2E-003: Data Consistency Validation**
```typescript
// Ensure API operations maintain data integrity 
```  
**Steps:**
  1. Perform operations that modify cart state
  2. Cross-validate with UI state where applicable
  3. Verify mathematical accuracy throughout
  - expect: API responses match expected business logic
  - expect: No data corruption during operations
  - expect: Consistent behavior across different user accounts

#### 3.6. API Performance and Load Testing

**Files:** `tests/api/comprehensive-api-tests.spec.ts` - Performance test suite  
**Configuration:** Performance benchmarks defined in `test-data/api-test-scenarios.json`

**Test Scenarios:**

**API-PERF-001: Response Time Benchmarks**
```typescript
const responseTimes = await apiClient.runPerformanceTest('getProducts', 5);
const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
```
**Performance Targets:**
  - Authentication API: Average < 2000ms, Max < 5000ms
  - Product Catalog API: Average < 3000ms, Max < 5000ms  
  - Cart Operations: Per operation < 3000ms
  - Checkout APIs: Complete flow < 10000ms

**Steps:**
  1. Execute each critical API endpoint 5 times
  2. Measure response times for each call
  3. Calculate average, minimum, and maximum response times
  - expect: All averages meet performance benchmarks
  - expect: No single request exceeds maximum thresholds
  - expect: Response times consistently acceptable

**API-PERF-002: Concurrent Request Handling**
```typescript
// Test multiple simultaneous API requests
const promises = Array(5).fill(0).map(() => apiClient.getProducts());
const results = await Promise.all(promises);
```
**Steps:**
  1. Execute multiple API clients simultaneously
  2. Send concurrent requests to same endpoints
  3. Validate all requests complete successfully
  - expect: All concurrent requests succeed
  - expect: No degradation in response quality
  - expect: System handles concurrent load appropriately

**API-PERF-003: Load Testing Simulation**
```typescript
// Simulate realistic user load on API endpoints
```
**Steps:**
  1. Simulate multiple users performing shopping workflows simultaneously
  2. Monitor system response under increased load
  3. Validate system stability and performance
  - expect: System maintains performance under realistic load
  - expect: No failures or timeouts under normal load conditions
  - expect: Graceful degradation if limits are reached

### 4. Cross Platform and Integration Testing

#### 4.1. UI/API Consistency Validation

**Integration Points:**
- UI login actions vs API authentication responses
- Shopping cart state synchronization between UI and API
- Product data consistency between frontend display and API responses
- Checkout flow data validation across both interfaces

**Test Strategy:**
```typescript
// Example: Validate cart state consistency
test('Cart state consistency between UI and API', async () => {
  // Add item via UI
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  
  // Validate via API
  const apiCart = await apiClient.getCart();
  expect(apiCart.data.itemCount).toBe(1);
  expect(apiCart.data.items[0].name).toBe('Sauce Labs Backpack');
});
```

#### 4.2. Error Handling Consistency

**Validation Points:**
- Same error messages displayed in UI and returned by API
- Consistent error codes and behavior between interfaces
- Proper error propagation from backend to frontend
- User experience consistency regardless of interface used

### 5. Test Execution and Reporting

#### 5.1. Running API Tests

**Individual Test Execution:**
```bash
# Run all API tests
npx playwright test tests/api/

# Run specific API test categories 
npx playwright test tests/api/comprehensive-api-tests.spec.ts --grep "Authentication"
npx playwright test tests/api/simple-api-examples.spec.ts --grep "Cart"

# Run with detailed reporting
npx playwright test tests/api/ --reporter=list
```

**Combined UI + API Execution:**
```bash
# Run complete test suite (UI + API)
npm test

# Run smoke tests across all interfaces
npx playwright test --grep "Health Check|Smoke"
```

#### 5.2. Performance Monitoring

**API Metrics Collection:**
- Response time tracking for all endpoints
- Success/failure rate monitoring
- Performance benchmark compliance
- Load testing results and trends

**Reporting Integration:**
- Performance data logged to console and files
- Results can be integrated with CI/CD dashboards  
- API metrics complement UI performance measurements
- Combined reporting provides comprehensive system health view

### 6. Continuous Integration and Automation

#### 6.1. CI/CD Pipeline Integration

**Test Execution Strategy:**
```yaml
# Example CI/CD configuration
stages:
  - api-health-check     # Quick API smoke tests
  - ui-smoke-tests       # Critical UI path validation
  - comprehensive-api    # Full API test suite
  - comprehensive-ui     # Full UI test suite
  - performance-tests    # API and UI performance validation
  - integration-tests    # Cross-platform consistency
```

**Parallel Execution:**
- API and UI tests can run in parallel for faster feedback
- Independent test data ensures no conflicts between test types
- Separate reporting streams provide targeted failure analysis

#### 6.2. Test Data Management in CI/CD

**Environment Configuration:**
- Same test data files used across all environments (dev, staging, prod)
- Environment-specific configurations via `environments.json`
- API endpoint URLs configured per environment
- Consistent test scenarios regardless of target environment

**Data Consistency:**
- Test data versioning ensures reproducible results
- Centralized data management prevents drift between UI and API tests
- Automated validation of test data integrity before test execution
