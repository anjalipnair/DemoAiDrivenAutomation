import * as fs from 'fs';
import * as path from 'path';

// Type definitions for test data structures
export interface User {
  username: string;
  password: string;
  description: string;
  expectedError?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string; 
  price: number;
  imageAlt: string;
  addToCartSelector: string;
  removeSelector: string;
}

export interface Customer {
  firstName: string;
  lastName: string;
  zipCode: string;
  description?: string;
  expectedError?: string;
}

export interface Environment {
  baseUrl: string;
  timeout: number;
  retries: number;
  headless: boolean;
  slowMo: number;
}

// Accessibility-related interfaces
export interface AccessibilityTestUser {
  username: string;
  password: string;
  description: string;
  expectedLoginSuccess: boolean;
  expectedErrorMessage?: string;
}

export interface KeyboardNavigationStep {
  step: number;
  elementId: string;
  elementType: string;
  inputType?: string;
  value?: string;
  description: string;
}

export interface WCAGCriterion {
  id: string;
  name: string;
  description: string;
  level: string;
  priority: string;
}

export interface AccessibilityViolation {
  ruleId: string;
  impact: string;
  description: string;
  help: string;
  expectedOnSauceDemo: boolean;
}

export interface AccessibilityTestScenario {
  scenarioId: string;
  name: string;
  description: string;
  testSteps: string[];
  expectedResults: any;
  testData?: any;
}

export interface FormElementAccessibility {
  id?: string;
  selector: string;
  expectedAttributes?: Record<string, any>;
  accessibilityRequirements: {
    hasLabel: boolean;
    hasAriaLabel?: boolean;
    hasPlaceholder?: boolean;
    isRequired?: boolean;
    isFocusable: boolean;
    hasKeyboardAccess?: boolean;
  };
}

/**
 * Test Data Manager - Centralized access to all test data
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private dataCache: Map<string, any> = new Map();
  
  private constructor() {}
  
  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }
  
  /**
   * Load test data file and cache it
   */
  private loadDataFile(fileName: string): any {
    if (this.dataCache.has(fileName)) {
      return this.dataCache.get(fileName);
    }
    
    // Map file names to their correct subdirectories
    const fileMapping: Record<string, string> = {
      'users': 'functional/users.json',
      'products': 'functional/products.json',
      'checkout': 'functional/checkout.json',
      'environments': 'functional/environments.json',
      'system': 'functional/system.json',
      'api-endpoints': 'api/api-endpoints.json',
      'api-test-scenarios': 'api/api-test-scenarios.json',
      'accessibility-config': 'accessibility/accessibility-config.json',
      'accessibility-scenarios': 'accessibility/accessibility-scenarios.json',
      'accessibility-test-data': 'accessibility/accessibility-test-data.json',
      'wcag-criteria': 'accessibility/wcag-criteria.json',
      'performance-benchmarks': 'performance/performance-benchmarks.json',
      'performance-datasets': 'performance/performance-datasets.json'
    };
    
    const relativePath = fileMapping[fileName] || `${fileName}.json`;
    const filePath = path.join(__dirname, '..', 'test-data', relativePath);
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      this.dataCache.set(fileName, data);
      return data;
    } catch (error) {
      throw new Error(`Failed to load test data file: ${fileName}.json - ${error}`);
    }
  }
  
  // User-related methods
  getUser(category: 'validUsers' | 'invalidUsers' | 'emptyFields', userKey: string): User {
    const userData = this.loadDataFile('users');
    return userData[category][userKey];
  }
  
  getAllValidUsers(): Record<string, User> {
    const userData = this.loadDataFile('users');
    return userData.validUsers;
  }
  
  getAllInvalidUsers(): Record<string, User> {
    const userData = this.loadDataFile('users');
    return userData.invalidUsers;
  }
  
  // Product-related methods
  getProduct(productKey: string): Product {
    const productData = this.loadDataFile('products');
    return productData.products[productKey];
  }
  
  getProductSet(setName: string): Product[] {
    const productData = this.loadDataFile('products');
    const productKeys = productData.testSets[setName];
    return productKeys.map(key => productData.products[key]);
  }
  
  getAllProducts(): Record<string, Product> {
    const productData = this.loadDataFile('products'); 
    return productData.products;
  }
  
  getSortingOption(sortKey: string) {
    const productData = this.loadDataFile('products');
    return productData.sorting[sortKey];
  }
  
  // Customer/Checkout methods
  getCustomer(category: 'validCustomers' | 'invalidCustomers', customerKey: string): Customer {
    const checkoutData = this.loadDataFile('checkout');
    return checkoutData[category][customerKey];
  }
  
  getPaymentInfo() {
    const checkoutData = this.loadDataFile('checkout');
    return checkoutData.paymentInfo.default;
  }
  
  getShippingInfo() {
    const checkoutData = this.loadDataFile('checkout');
    return checkoutData.shippingInfo.default;
  }
  
  getCheckoutMessage(messageKey: string) {
    const checkoutData = this.loadDataFile('checkout');
    return checkoutData.messages[messageKey];
  }
  
  // System configuration methods
  getSelector(category: string, selectorKey: string): string {
    const systemData = this.loadDataFile('system');
    return systemData.selectors[category][selectorKey];
  }
  
  getUrl(urlKey: string): string {
    const systemData = this.loadDataFile('system');
    return systemData.urls[urlKey];
  }
  
  getBaseUrl(): string {
    const systemData = this.loadDataFile('system');
    return systemData.baseUrl;
  }
  
  getTimeout(timeoutKey: string): number {
    const systemData = this.loadDataFile('system');
    return systemData.timeouts[timeoutKey];
  }
  
  getErrorMessage(errorKey: string): string {
    const systemData = this.loadDataFile('system');
    return systemData.errorMessages[errorKey];
  }
  
  getExpectedText(textKey: string): string {
    const systemData = this.loadDataFile('system');
    return systemData.expectedTexts[textKey];
  }
  
  // Environment configuration
  getEnvironment(envName: string = 'production'): Environment {
    const envData = this.loadDataFile('environments');
    return envData.environments[envName];
  }
  
  getTestDataSet(setName: 'smoke' | 'regression' | 'fullSuite') {
    const envData = this.loadDataFile('environments');
    return envData.testDataSets[setName];
  }
  
  getBrowserConfig(browserName: string) {
    const envData = this.loadDataFile('environments');
    return envData.browserConfigs[browserName];
  }

  // Accessibility testing methods
  getAccessibilityTestUser(userKey: string): AccessibilityTestUser {
    const accessibilityData = this.loadDataFile('accessibility-test-data');
    return accessibilityData.wcagCompliance.testUsers.find(user => 
      user.username === userKey || user.description.toLowerCase().includes(userKey.toLowerCase())
    );
  }

  getAllAccessibilityTestUsers(): AccessibilityTestUser[] {
    const accessibilityData = this.loadDataFile('accessibility-test-data');
    return accessibilityData.wcagCompliance.testUsers;
  }

  getKeyboardNavigationSteps(): KeyboardNavigationStep[] {
    const accessibilityData = this.loadDataFile('accessibility-test-data');
    return accessibilityData.wcagCompliance.keyboardNavigation.expectedTabOrder;
  }

  getAccessibilityThresholds() {
    const accessibilityData = this.loadDataFile('accessibility-test-data');
    return accessibilityData.wcagCompliance.accessibilityThresholds;
  }

  getExpectedSemanticStructure() {
    const accessibilityData = this.loadDataFile('accessibility-test-data');
    return accessibilityData.wcagCompliance.expectedSemanticStructure;
  }

  getWCAGCriteria(level: string = 'AA'): WCAGCriterion[] {
    const wcagData = this.loadDataFile('wcag-criteria');
    return wcagData.wcagCriteria[`level_${level}`];
  }

  getCommonViolations(pageType: string = 'loginPage'): AccessibilityViolation[] {
    const wcagData = this.loadDataFile('wcag-criteria');
    return wcagData.commonViolations[pageType];
  }

  getFormElementAccessibility(elementType: string): FormElementAccessibility {
    const formData = this.loadDataFile('form-elements-accessibility');
    return formData.loginFormElements[elementType];
  }

  getAllFormElements() {
    const formData = this.loadDataFile('form-elements-accessibility');
    return formData.loginFormElements;
  }

  getFocusIndicatorRequirements() {
    const formData = this.loadDataFile('form-elements-accessibility');
    return formData.focusIndicators;
  }

  getAccessibilityTestScenario(scenarioId: string): AccessibilityTestScenario {
    const scenarioData = this.loadDataFile('accessibility-scenarios');
    return scenarioData.accessibilityTestScenarios.find(scenario => 
      scenario.scenarioId === scenarioId
    );
  }

  getAllAccessibilityTestScenarios(): AccessibilityTestScenario[] {
    const scenarioData = this.loadDataFile('accessibility-scenarios');
    return scenarioData.accessibilityTestScenarios;
  }

  getAccessibilityTestEnvironment(environmentType: string = 'desktop') {
    const scenarioData = this.loadDataFile('accessibility-scenarios');
    return scenarioData.testEnvironments[environmentType];
  }

  getAxeConfiguration() {
    const configData = this.loadDataFile('accessibility-config');
    return configData.accessibilityTestData.testConfiguration.axeOptions;
  }

  getAccessibilityReportingConfig() {
    const configData = this.loadDataFile('accessibility-config');
    return configData.accessibilityTestData.reportingConfig;
  }

  getAccessibilityValidationRules() {
    const configData = this.loadDataFile('accessibility-config');
    return configData.accessibilityTestData.validationRules;
  }

  getKnownAccessibilityIssues() {
    const configData = this.loadDataFile('accessibility-config');
    return configData.accessibilityTestData.knownIssues;
  }
}

// Export singleton instance
export const testData = TestDataManager.getInstance();

// Convenience functions for common operations
export const getValidUser = (userKey: string) => testData.getUser('validUsers', userKey);
export const getInvalidUser = (userKey: string) => testData.getUser('invalidUsers', userKey);
export const getProduct = (productKey: string) => testData.getProduct(productKey);
export const getCustomer = (customerKey: string) => testData.getCustomer('validCustomers', customerKey);
export const getSelector = (category: string, selectorKey: string) => testData.getSelector(category, selectorKey);
export const getUrl = (urlKey: string) => testData.getUrl(urlKey);
export const getErrorMessage = (errorKey: string) => testData.getErrorMessage(errorKey);

// Convenience functions for accessibility testing
export const getAccessibilityUser = (userKey: string) => testData.getAccessibilityTestUser(userKey);
export const getKeyboardNavigation = () => testData.getKeyboardNavigationSteps();
export const getAccessibilityThresholds = () => testData.getAccessibilityThresholds();
export const getWCAGCriteria = (level: string = 'AA') => testData.getWCAGCriteria(level);
export const getAccessibilityScenario = (scenarioId: string) => testData.getAccessibilityTestScenario(scenarioId);
export const getAxeConfig = () => testData.getAxeConfiguration();
export const getFormElement = (elementType: string) => testData.getFormElementAccessibility(elementType);