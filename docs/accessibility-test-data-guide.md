# Accessibility Test Data Documentation

## Overview

This directory contains comprehensive test data files specifically designed to support WCAG 2.1 compliance testing for the SauceDemo application. The test data is organized into several JSON files, each serving specific aspects of accessibility testing.

## Test Data Files

### 1. accessibility-test-data.json
**Purpose**: Core accessibility test data including users, keyboard navigation, and semantic structure expectations.

**Key Sections**:
- `testUsers`: User credentials for different accessibility testing scenarios
- `keyboardNavigation`: Expected tab order and focus sequence
- `expectedSemanticStructure`: Expected form elements, landmarks, and headings
- `accessibilityThresholds`: Maximum allowed violations by severity level

### 2. wcag-criteria.json  
**Purpose**: WCAG 2.1 Level AA criteria definitions and common violation types.

**Key Sections**:
- `level_AA`: Complete list of WCAG 2.1 AA criteria with descriptions
- `commonViolations`: Expected violations for the SauceDemo login page

### 3. form-elements-accessibility.json
**Purpose**: Detailed accessibility requirements and attributes for form elements.

**Key Sections**:
- `loginFormElements`: Specifications for username, password, and submit button
- `focusIndicators`: Expected focus indicator styles and requirements  
- `imageElements`: Image accessibility requirements
- `headingStructure`: Expected heading hierarchy

### 4. accessibility-scenarios.json
**Purpose**: Comprehensive test scenarios covering different accessibility aspects.

**Key Sections**:
- `accessibilityTestScenarios`: Detailed test cases with steps and expected results
- `testEnvironments`: Viewport configurations for different devices
- `assistiveTechnology`: Simulated screen reader behavior

### 5. accessibility-config.json
**Purpose**: Configuration settings for accessibility testing tools and reporting.

**Key Sections**:
- `axeOptions`: Configuration for axe-core scanner
- `reportingConfig`: Settings for test result reporting
- `validationRules`: Test validation criteria 
- `knownIssues`: Documented accessibility issues with explanations

## Usage Examples

### Basic Usage in Test Files

```typescript
import { 
  getAccessibilityUser, 
  getKeyboardNavigation,
  getAccessibilityThresholds,
  getAxeConfig 
} from '../utils/testDataManager';

test('WCAG Compliance Test', async ({ page }) => {
  // Load test user
  const testUser = getAccessibilityUser('standard_user');
  
  // Get keyboard navigation steps
  const keyboardSteps = getKeyboardNavigation();
  
  // Get validation thresholds
  const thresholds = getAccessibilityThresholds();
  
  // Configure axe-core
  const axeConfig = getAxeConfig();
});
```

### Advanced Scenario Testing

```typescript
import { getAccessibilityScenario } from '../utils/testDataManager';

test('Keyboard Navigation Scenario', async ({ page }) => {
  const scenario = getAccessibilityScenario('KBD-001');
  
  // Execute test steps from scenario data
  for (const step of scenario.testSteps) {
    // Implement step logic based on step description
  }
  
  // Validate against expected results
  expect(actualResults).toMatchObject(scenario.expectedResults);
});
```

### Form Element Validation

```typescript
import { getFormElement, getAllFormElements } from '../utils/testDataManager';

test('Form Accessibility Validation', async ({ page }) => {
  const usernameField = getFormElement('usernameField');
  
  // Validate element attributes
  const element = page.locator(`#${usernameField.id}`);
  
  for (const [attr, expected] of Object.entries(usernameField.expectedAttributes)) {
    const actual = await element.getAttribute(attr);
    expect(actual).toBe(expected);
  }
});
```

## Test Data Structure

### User Data Structure
```typescript
interface AccessibilityTestUser {
  username: string;
  password: string;
  description: string;
  expectedLoginSuccess: boolean;
  expectedErrorMessage?: string;
}
```

### Keyboard Navigation Structure
```typescript
interface KeyboardNavigationStep {
  step: number;
  elementId: string;
  elementType: string;
  inputType?: string;
  value?: string;
  description: string;
}
```

### WCAG Criteria Structure
```typescript
interface WCAGCriterion {
  id: string;
  name: string;
  description: string;
  level: string;
  priority: string;
}
```

## Available Test Data Methods

### User Management
- `getAccessibilityTestUser(userKey)` - Get specific test user
- `getAllAccessibilityTestUsers()` - Get all test users

### Navigation & Structure
- `getKeyboardNavigationSteps()` - Get expected tab order
- `getExpectedSemanticStructure()` - Get expected page structure
- `getFocusIndicatorRequirements()` - Get focus indicator specifications

### WCAG Compliance
- `getWCAGCriteria(level)` - Get WCAG criteria for specific level
- `getCommonViolations(pageType)` - Get expected violations
- `getAccessibilityThresholds()` - Get violation thresholds

### Configuration
- `getAxeConfiguration()` - Get axe-core settings
- `getAccessibilityReportingConfig()` - Get reporting configuration
- `getAccessibilityValidationRules()` - Get validation rules

### Scenarios
- `getAccessibilityTestScenario(id)` - Get specific test scenario
- `getAllAccessibilityTestScenarios()` - Get all test scenarios

## Best Practices

1. **Data-Driven Testing**: Use test data to drive test scenarios rather than hardcoding values
2. **Configuration Management**: Centralize accessibility tool configuration in test data
3. **Threshold Management**: Use configurable thresholds for violation validation
4. **Scenario Documentation**: Document test scenarios with expected results
5. **Known Issues**: Document known accessibility issues with explanations

## Integration with Existing Tests

The accessibility test data integrates seamlessly with the existing TestDataManager utility:

```typescript
// Import existing test data utilities
import { testData, getValidUser, getSelector } from '../utils/testDataManager';

// Use alongside accessibility-specific methods
const regularUser = getValidUser('standardUser'); 
const accessibilityUser = getAccessibilityUser('standard_user');
const loginButton = getSelector('auth', 'loginButton');
```

## Maintenance

- Update test data when application UI changes
- Review WCAG criteria annually for updates
- Adjust thresholds based on accessibility improvement goals
- Document new accessibility issues as they are discovered
- Keep scenario descriptions current with test implementation

This comprehensive test data structure provides a solid foundation for implementing thorough accessibility testing while maintaining flexibility and maintainability.