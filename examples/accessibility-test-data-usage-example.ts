// Example usage of accessibility test data in wcag-login-compliance.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { 
  getAccessibilityUser, 
  getKeyboardNavigation,
  getAccessibilityThresholds,
  getAxeConfig,
  getFormElement
} from '../../utils/testDataManager';

test.describe('WCAG 2.1 Compliance Testing with Test Data', () => {
  
  test('Login Page WCAG AA Compliance - Data Driven', async ({ page }) => {
    // Load test configuration
    const axeConfig = getAxeConfig();
    const thresholds = getAccessibilityThresholds();
    const keyboardSteps = getKeyboardNavigation();
    
    // Navigate to the application
    await page.goto('https://www.saucedemo.com');
    
    // Run axe-core with configuration from test data
    const axeResults = await new AxeBuilder({ page })
      .withTags(axeConfig.tags)
      .exclude(axeConfig.exclude)
      .analyze();
    
    // Validate against thresholds defined in test data
    const criticalViolations = axeResults.violations.filter(v => v.impact === 'critical');
    const seriousViolations = axeResults.violations.filter(v => v.impact === 'serious'); 
    
    expect(criticalViolations).toHaveLength(thresholds.maxCriticalViolations);
    expect(seriousViolations).toHaveLength(thresholds.maxSeriousViolations);
    
    // Test keyboard navigation using test data
    for (const step of keyboardSteps) {
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        const element = document.activeElement as HTMLInputElement;
        return {
          id: element?.id,
          tagName: element?.tagName.toLowerCase(),
          type: element?.type
        };
      });
      
      expect(focusedElement.id).toBe(step.elementId);
      expect(focusedElement.tagName).toBe(step.elementType);
      
      if (step.inputType) {
        expect(focusedElement.type).toBe(step.inputType);
      }
    }
    
    // Test login with accessibility test user
    const testUser = getAccessibilityUser('standard_user');
    
    await page.fill('#user-name', testUser.username);
    await page.fill('#password', testUser.password);
    await page.click('#login-button');
    
    if (testUser.expectedLoginSuccess) {
      await expect(page).toHaveURL(/.*inventory.html/);
    } else {
      await expect(page.locator('.error-message-container')).toBeVisible();
      if (testUser.expectedErrorMessage) {
        await expect(page.locator('.error-message-container')).toContainText(testUser.expectedErrorMessage);
      }
    }
    
    // Validate form elements accessibility using test data 
    const usernameField = getFormElement('usernameField');
    const passwordField = getFormElement('passwordField');
    const loginButton = getFormElement('loginButton');
    
    // Check username field accessibility
    const usernameElement = await page.locator(`#${usernameField.id}`);
    await expect(usernameElement).toBeVisible();
    await expect(usernameElement).toBeFocused();
    
    // Verify expected attributes from test data
    for (const [attr, expectedValue] of Object.entries(usernameField.expectedAttributes)) {
      const actualValue = await usernameElement.getAttribute(attr);
      expect(actualValue).toBe(expectedValue);
    }
  });
  
  test('Error Message Accessibility - Data Driven', async ({ page }) => {
    // Load locked out user for error testing
    const lockedUser = getAccessibilityUser('locked_out_user');
    
    await page.goto('https://www.saucedemo.com');
    await page.fill('#user-name', lockedUser.username);
    await page.fill('#password', lockedUser.password);
    await page.click('#login-button');
    
    // Verify error message accessibility
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(lockedUser.expectedErrorMessage!);
    
    // Run axe scan on error state
    const axeResults = await new AxeBuilder({ page }).analyze();
    const criticalViolations = axeResults.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);
  });
});

// This example shows how the test data can be used to:
// 1. Configure axe-core scanning options
// 2. Set validation thresholds 
// 3. Drive keyboard navigation testing
// 4. Provide test user credentials
// 5. Validate form element properties
// 6. Test error scenarios with expected messages