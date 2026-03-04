// spec: specs/orangehrm-comprehensive-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('People Management Solution Features Testing', () => {
  test('Test Scenario 1.2: People Management Solution Features', async ({ page }) => {
    // 1. Navigate to OrangeHRM homepage (https://www.orangehrm.com/)
    await page.goto('https://www.orangehrm.com/');

    // Verify page loads successfully
    await expect(page.getByText('Streamline All Your HR Needs on One Intuitive Platform')).toBeVisible({
      timeout: 10000
    });
    
    // Verify navigation menu is visible
    await expect(page.locator('nav')).toBeVisible();
    
    // Verify Solutions link is prominently displayed
    await expect(page.getByRole('link', { name: 'Solutions' })).toBeVisible();

    // 2. Accept cookie consent dialog if present
    try {
      // Check if cookie consent dialog is present and handle it gracefully
      const cookieButton = page.getByRole('button', { name: 'Allow all' });
      await expect(cookieButton).toBeVisible({ timeout: 3000 });
      await cookieButton.click();
      
      // Verify main content becomes accessible after cookie handling
      await expect(page.getByText('Streamline All Your HR Needs on One Intuitive Platform')).toBeVisible();
    } catch (error) {
      // Cookie dialog not present or already dismissed - continue with test
      console.log('Cookie consent dialog not found or already handled');
    }

    // 3. Click on People Management from Solutions dropdown
    // First click on Solutions to open dropdown
    await page.getByRole('link', { name: 'Solutions' }).click();
    
    // Wait for dropdown to be visible
    await expect(page.getByRole('link', { name: 'People Management' })).toBeVisible({ timeout: 5000 });
    
    // Click on People Management
    await page.getByRole('link', { name: 'People Management' }).click();

    // Verify People Management page loads successfully
    await expect(page).toHaveURL(/.*people-management.*/, { timeout: 10000 });
    
    // Verify page title reflects People Management content
    await expect(page).toHaveTitle(/.*People Management.*|.*HR Management.*|.*Employee Management.*/);
    
    // Verify main heading displays 'People Management' or similar HR-focused heading
    const mainHeadingSelectors = [
      page.getByRole('heading', { name: /People Management/i, level: 1 }),
      page.getByRole('heading', { name: /HR Management/i, level: 1 }),
      page.getByRole('heading', { name: /Employee Management/i, level: 1 }),
      page.locator('h1:has-text("People Management"), h1:has-text("HR Management"), h1:has-text("Employee Management")')
    ];
    
    let headingFound = false;
    for (const selector of mainHeadingSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 3000 });
        headingFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    
    if (!headingFound) {
      // Fallback: check for any prominent heading on the page
      await expect(page.locator('h1')).toBeVisible();
    }

    // 4. Verify page describes comprehensive HR software capabilities
    // Look for detailed description of HR solutions presence
    const hrDescriptionSelectors = [
      page.locator('text=HR software'),
      page.locator('text=human resource'),
      page.locator('text=employee management'),
      page.locator('text=workforce'),
      page.locator('text=personnel'),
      page.getByText(/comprehensive.*HR/i),
      page.getByText(/complete.*HR/i)
    ];
    
    let descriptionFound = false;
    for (const selector of hrDescriptionSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 2000 });
        descriptionFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(descriptionFound).toBe(true);

    // Verify key features and benefits are highlighted
    const featuresSelectors = [
      page.locator('text=features'),
      page.locator('text=benefits'),
      page.locator('text=capabilities'),
      page.locator('text=solutions'),
      page.locator('ul li, .features, .benefits')
    ];
    
    let featuresFound = false;
    for (const selector of featuresSelectors) {
      try {
        await expect(selector.first()).toBeVisible({ timeout: 2000 });
        featuresFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(featuresFound).toBe(true);

    // Verify professional presentation of content
    await expect(page.locator('main')).toBeVisible();

    // 5. Verify key HR functionality sections are displayed
    // Check for employee information management description
    const employeeManagementSelectors = [
      page.locator('text=employee information'),
      page.locator('text=employee data'),
      page.locator('text=personnel record'),
      page.locator('text=staff information'),
      page.getByText(/employee.*management/i),
      page.getByText(/manage.*employee/i)
    ];
    
    let employeeManagementFound = false;
    for (const selector of employeeManagementSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 2000 });
        employeeManagementFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(employeeManagementFound).toBe(true);

    // Check for time tracking capabilities mention
    const timeTrackingSelectors = [
      page.locator('text=time tracking'),
      page.locator('text=attendance'),
      page.locator('text=time management'),
      page.locator('text=clock in'),
      page.getByText(/time.*track/i),
      page.getByText(/attendance.*management/i)
    ];
    
    let timeTrackingFound = false;
    for (const selector of timeTrackingSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 2000 });
        timeTrackingFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(timeTrackingFound).toBe(true);

    // Check for leave management features detail
    const leaveManagementSelectors = [
      page.locator('text=leave management'),
      page.locator('text=vacation'),
      page.locator('text=time off'),
      page.locator('text=absence'),
      page.getByText(/leave.*management/i),
      page.getByText(/vacation.*management/i)
    ];
    
    let leaveManagementFound = false;
    for (const selector of leaveManagementSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 2000 });
        leaveManagementFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(leaveManagementFound).toBe(true);

    // Check for performance tracking inclusion
    const performanceTrackingSelectors = [
      page.locator('text=performance'),
      page.locator('text=evaluation'),
      page.locator('text=assessment'),
      page.locator('text=review'),
      page.getByText(/performance.*management/i),
      page.getByText(/performance.*tracking/i)
    ];
    
    let performanceTrackingFound = false;
    for (const selector of performanceTrackingSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 2000 });
        performanceTrackingFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(performanceTrackingFound).toBe(true);

    // 6. Check for call-to-action elements
    // Verify free trial or demo options are available
    const ctaSelectors = [
      page.getByRole('link', { name: /free trial/i }),
      page.getByRole('link', { name: /demo/i }),
      page.getByRole('button', { name: /free trial/i }),
      page.getByRole('button', { name: /demo/i }),
      page.locator('a:has-text("Free Trial"), a:has-text("Demo"), button:has-text("Free Trial"), button:has-text("Demo")')
    ];
    
    let ctaFound = false;
    for (const selector of ctaSelectors) {
      try {
        await expect(selector.first()).toBeVisible({ timeout: 2000 });
        ctaFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(ctaFound).toBe(true);

    // Verify contact information is accessible
    const contactSelectors = [
      page.getByRole('link', { name: /contact/i }),
      page.getByRole('button', { name: /contact/i }),
      page.locator('a:has-text("Contact"), button:has-text("Contact")'),
      page.locator('[href*="contact"]'),
      page.locator('text=contact us')
    ];
    
    let contactFound = false;
    for (const selector of contactSelectors) {
      try {
        await expect(selector.first()).toBeVisible({ timeout: 2000 });
        contactFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(contactFound).toBe(true);

    // Verify clear next steps for prospects are present
    const nextStepsSelectors = [
      page.getByRole('link', { name: /get started/i }),
      page.getByRole('button', { name: /get started/i }),
      page.getByRole('link', { name: /learn more/i }),
      page.getByRole('button', { name: /learn more/i }),
      page.locator('a:has-text("Get Started"), button:has-text("Get Started"), a:has-text("Learn More"), button:has-text("Learn More")')
    ];
    
    let nextStepsFound = false;
    for (const selector of nextStepsSelectors) {
      try {
        await expect(selector.first()).toBeVisible({ timeout: 2000 });
        nextStepsFound = true;
        break;
      } catch (error) {
        // Continue to next selector
      }
    }
    expect(nextStepsFound).toBe(true);

    console.log('✅ People Management solution page testing completed successfully');
  });
});