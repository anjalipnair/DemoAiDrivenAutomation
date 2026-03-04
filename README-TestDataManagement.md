# Test Data Management for SauceDemo Automation

## 🎯 Overview

This repository implements a comprehensive, centralized test data management system for SauceDemo automation testing. The approach ensures maintainability, reusability, and consistency across all test scenarios while supporting data-driven testing patterns.

## 📁 Directory Structure

```
DemoAiDrivenAutomation/
├── test-data/               # Centralized test data files
│   ├── users.json          # Authentication credentials & user accounts
│   ├── products.json       # Product catalog & shopping data
│   ├── checkout.json       # Customer info & checkout flow data
│   ├── system.json         # URLs, selectors, messages & configuration
│   └── environments.json   # Environment configs & test data sets
├── utils/
│   └── testDataManager.ts  # TypeScript utility for data access
├── examples/
│   └── testDataUsage.spec.ts # Example test implementations
├── specs/
│   └── comprehensive-saucedemo-test-plan.md # Updated test plan
└── tests/                  # Actual test files (using centralized data)
```

## 🚀 Quick Start

### 1. Installation & Setup

```bash
# Install dependencies (if not already installed)
npm install

# Verify test data files are accessible
ls -la test-data/
```

### 2. Basic Usage in Tests

```typescript
import { testData, getValidUser, getProduct, getCustomer } from '../utils/testDataManager';

test('Login with centralized data', async ({ page }) => {
  // Get user from centralized source
  const user = getValidUser('standard');
  
  // Navigate using centralized URL
  await page.goto(testData.getBaseUrl());
  
  // Use centralized selectors
  await page.fill(testData.getSelector('login', 'username'), user.username);
  await page.fill(testData.getSelector('login', 'password'), user.password);
  await page.click(testData.getSelector('login', 'loginButton'));
});
```

### 3. Data-Driven Testing

```typescript
// Automatically test all valid users
const validUsers = testData.getAllValidUsers();
Object.entries(validUsers).forEach(([userKey, userData]) => {
  test(`Login success for ${userKey}`, async ({ page }) => {
    // Test implementation using userData
  });
});
```

## 📊 Test Data Categories

### 🔐 Authentication Data (`users.json`)

| Category | Users Available | Purpose |
|----------|----------------|---------|
| **validUsers** | `standard`, `performance`, `problem`, `error`, `visual` | Successful login scenarios |
| **invalidUsers** | `locked`, `invalid`, `wrongPassword` | Failed login scenarios |
| **emptyFields** | `noUsername`, `noPassword`, `bothEmpty` | Form validation testing |

**Example Usage:**
```typescript
const user = getValidUser('standard');           // Gets standard_user credentials
const lockedUser = testData.getUser('invalidUsers', 'locked'); // Gets locked_out_user
```

### 🛒 Product Data (`products.json`)

| Products Available | Price | Product Sets |
|-------------------|-------|--------------|
| `backpack` | $29.99 | `singleItem` |
| `bikeLight` | $9.99 | `multipleItems` |
| `tshirt` | $15.99 | `expensiveItems` |
| `fleeceJacket` | $49.99 | `cheapItems` |
| `onesie` | $7.99 | `allItems` |
| `boltTshirt` | $15.99 | |

**Example Usage:**
```typescript
const product = getProduct('backpack');                    // Single product
const products = testData.getProductSet('multipleItems'); // Array of products
const sorting = testData.getSortingOption('priceLowHigh'); // Sorting configuration
```

### 👤 Customer Data (`checkout.json`)

| Category | Customers | Fields |
|----------|-----------|--------|
| **validCustomers** | `customer1`, `customer2`, `customer3` | firstName, lastName, zipCode |
| **invalidCustomers** | `noFirstName`, `noLastName`, `noZipCode`, `allEmpty` | With expectedError |

**Example Usage:**
```typescript
const customer = getCustomer('customer1');                    // Valid customer info
const invalidData = testData.getCustomer('invalidCustomers', 'noFirstName');
const paymentInfo = testData.getPaymentInfo();              // SauceCard #31337
```

### ⚙️ System Configuration (`system.json`)

| Configuration Type | Examples |
|-------------------|----------|
| **URLs** | `/inventory.html`, `/cart.html`, `/checkout-step-one.html` |
| **Selectors** | `[data-test='username']`, `[data-test='add-to-cart-sauce-labs-backpack']` |
| **Error Messages** | `Epic sadface: Username is required` |
| **Timeouts** | `short: 2000ms`, `medium: 5000ms`, `long: 10000ms` |

**Example Usage:**
```typescript
await page.goto(testData.getBaseUrl() + testData.getUrl('inventory'));
await page.fill(testData.getSelector('login', 'username'), username);
await expect(page.locator('.error')).toHaveText(testData.getErrorMessage('usernameRequired'));
```

### 🌍 Environment Configuration (`environments.json`)

| Environment | Base URL | Test Data Set | Browser Config |
|-------------|----------|---------------|----------------|
| **development** | `dev.saucedemo.com` | Full debugging | Headless: false |
| **staging** | `staging.saucedemo.com` | Regression set | Headless: true |
| **production** | `www.saucedemo.com` | Smoke tests | Headless: true |

**Example Usage:**
```typescript
const env = testData.getEnvironment('production');
const smokeTests = testData.getTestDataSet('smoke');
const browserConfig = testData.getBrowserConfig('chrome');
```

## 🔧 Advanced Features

### Environment-Specific Testing

```bash
# Run tests against different environments
TEST_ENV=development npm run test
TEST_ENV=staging npm run test
TEST_ENV=production npm run test  # default
```

```typescript
// In your test
const environment = testData.getEnvironment(process.env.TEST_ENV || 'production');
await page.goto(environment.baseUrl);
```

### Custom Test Data Sets

Create focused test runs with specific data combinations:

```typescript
// Run only smoke tests with minimal data
const smokeSet = testData.getTestDataSet('smoke');
// Users: ['standard'], Products: ['backpack'], Customers: ['customer1']

// Run full regression with comprehensive data  
const regressionSet = testData.getTestDataSet('regression');
// Users: ['standard', 'performance', 'problem']
// Products: ['backpack', 'bikeLight', 'fleeceJacket']
```

### Type Safety

All test data access is type-safe with TypeScript interfaces:

```typescript
interface User {
  username: string;
  password: string;
  description: string;
  expectedError?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  addToCartSelector: string;
  removeSelector: string;
}
```

## 📝 Best Practices

### ✅ Do's

- **Always use centralized data** instead of hardcoded values in tests
- **Use descriptive data keys** that clearly indicate the test scenario
- **Leverage data sets** for consistent multi-test scenarios  
- **Update test data files** when application changes occur
- **Use TypeScript interfaces** to catch data structure errors early
- **Cache frequently accessed data** for better performance

### ❌ Don'ts

- **Don't hardcode credentials** or test data in test files
- **Don't duplicate data** across multiple files
- **Don't mix test logic** with test data definitions
- **Don't skip data validation** when adding new test data
- **Don't ignore TypeScript errors** in data access

## 🛠️ Maintenance

### Adding New Test Data

1. **Identify the category** (users, products, checkout, system, environment)
2. **Add data to appropriate JSON file** with descriptive keys
3. **Update TypeScript interfaces** if needed
4. **Add convenience methods** to `testDataManager.ts` if required
5. **Update documentation** and examples

### Updating Existing Data

1. **Locate the data** in the appropriate JSON file
2. **Update values** while maintaining the structure
3. **Run tests** to ensure no breaking changes
4. **Update any related documentation**

### Data Validation

```typescript
// Example validation in tests
const user = getValidUser('standard');
expect(user).toHaveProperty('username');
expect(user).toHaveProperty('password');
expect(user.username).toBeTruthy();
```

## 📈 Performance Considerations

- **Caching**: TestDataManager caches loaded files to avoid repeated disk I/O
- **Lazy Loading**: Data files are loaded only when first accessed  
- **Memory Efficiency**: Large data sets can be organized using data set configurations
- **Parallel Execution**: Thread-safe design supports parallel test execution

## 🔄 Migration Guide

### From Hardcoded Data

**Before:**
```typescript
await page.fill('[data-test="username"]', 'standard_user');
await page.fill('[data-test="password"]', 'secret_sauce');
```

**After:**
```typescript
const user = getValidUser('standard');
await page.fill(getSelector('login', 'username'), user.username);
await page.fill(getSelector('login', 'password'), user.password);
```

### From Scattered Data Files

1. **Consolidate** existing data files into the standard structure
2. **Replace direct file imports** with TestDataManager calls
3. **Update selectors** to use centralized selector definitions
4. **Standardize error messages** using the central error catalog

## 🧪 Testing the Test Data System

```bash
# Run example tests to verify data access
npm run test examples/testDataUsage.spec.ts

# Validate data file integrity
node -e "console.log(JSON.parse(require('fs').readFileSync('test-data/users.json')))"
```

## 📚 Additional Resources

- **[Comprehensive Test Plan](specs/comprehensive-saucedemo-test-plan.md)** - Complete test scenarios with data references
- **[Example Usage](examples/testDataUsage.spec.ts)** - Practical implementation examples
- **[TypeScript Interfaces](utils/testDataManager.ts)** - Complete type definitions

## 🤝 Contributing

When adding new test scenarios:

1. **Create test data entries** in appropriate JSON files first
2. **Use the TestDataManager** for all data access
3. **Follow naming conventions** for consistency
4. **Add type definitions** for new data structures
5. **Update documentation** with usage examples

---

🎯 **Result**: Maintainable, scalable, and reliable test automation with centralized data management!