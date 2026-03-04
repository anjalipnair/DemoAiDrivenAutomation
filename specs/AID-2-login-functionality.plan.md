# AID-2: Comprehensive Test Plan for Saucedemo Login Functionality

## Application Overview

This test plan covers comprehensive testing of the login functionality for saucedemo.com based on user story AID-2. The application provides a demo e-commerce site with multiple user types including standard users, locked out users, and users with different behavioral characteristics. The login system includes proper validation, error handling, session management, and security features.

## Test Scenarios

### 1. Login Authentication Suite

**Seed:** `tests/login-setup.spec.ts`

#### 1.1. Successful Login with Valid Credentials

**File:** `tests/login-auth/successful-login.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed
    - expect: Username and password fields are visible
    - expect: Login button is present
    - expect: Accepted usernames and password information is displayed
  2. Enter valid username 'standard_user' in the username field
    - expect: Username is entered and displayed correctly
    - expect: No validation errors appear
  3. Enter valid password 'secret_sauce' in the password field
    - expect: Password characters are masked (not visible as plain text)
    - expect: No validation errors appear
    - expect: Login button becomes enabled
  4. Click the Login button
    - expect: User is redirected to inventory/products page (inventory.html)
    - expect: Products catalog is displayed
    - expect: User session is established
    - expect: Hamburger menu is accessible in header
  5. Verify session maintenance by navigating between pages
    - expect: User remains logged in while browsing products
    - expect: Session persists across page navigation

#### 1.2. Failed Login with Invalid Username

**File:** `tests/login-auth/invalid-username.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed and ready for input
  2. Enter invalid username 'invalid_user' in the username field
    - expect: Invalid username is entered and displayed
  3. Enter valid password 'secret_sauce' in the password field
    - expect: Password is entered and masked properly
  4. Click the Login button
    - expect: Error message 'Epic sadface: Username and password do not match any user in this service' is displayed
    - expect: Error icons appear next to username and password fields
    - expect: User remains on login page
    - expect: Login button is still functional
  5. Click the error message close button (X)
    - expect: Error message disappears
    - expect: Error icons are removed
    - expect: Form is ready for new input

#### 1.3. Failed Login with Invalid Password

**File:** `tests/login-auth/invalid-password.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed and ready for input
  2. Enter valid username 'standard_user' in the username field
    - expect: Valid username is entered and displayed
  3. Enter invalid password 'wrong_password' in the password field
    - expect: Invalid password is entered and masked
  4. Click the Login button
    - expect: Error message 'Epic sadface: Username and password do not match any user in this service' is displayed
    - expect: Error icons appear next to both fields
    - expect: User remains on login page

#### 1.4. Locked User Account Handling

**File:** `tests/login-auth/locked-user.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed and ready for input
  2. Enter locked username 'locked_out_user' in the username field
    - expect: Locked username is entered and displayed
  3. Enter valid password 'secret_sauce' in the password field
    - expect: Password is entered and masked properly
  4. Click the Login button
    - expect: Error message 'Epic sadface: Sorry, this user has been locked out.' is displayed
    - expect: Error icons appear next to fields
    - expect: User cannot access the system
    - expect: Appropriate locked account messaging is shown

### 2. Login Validation Suite

**Seed:** `tests/validation-setup.spec.ts`

#### 2.1. Empty Username Validation

**File:** `tests/login-validation/empty-username.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed with empty form fields
  2. Leave username field empty and enter password 'secret_sauce'
    - expect: Password field contains masked characters
    - expect: Username field remains empty
  3. Click the Login button
    - expect: Error message 'Epic sadface: Username is required' is displayed
    - expect: Error icons appear highlighting required field
    - expect: Login is prevented
    - expect: Form validation works correctly

#### 2.2. Empty Password Validation

**File:** `tests/login-validation/empty-password.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed with empty form fields
  2. Enter username 'standard_user' and leave password field empty
    - expect: Username field contains entered value
    - expect: Password field remains empty
  3. Click the Login button
    - expect: Error message 'Epic sadface: Password is required' is displayed
    - expect: Error icons appear highlighting required field
    - expect: Login is prevented
    - expect: Form validation works correctly

#### 2.3. Both Fields Empty Validation

**File:** `tests/login-validation/both-fields-empty.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed with empty form fields
  2. Leave both username and password fields empty
    - expect: Both fields are empty and ready for input
  3. Click the Login button
    - expect: Error message 'Epic sadface: Username is required' is displayed (username validation takes precedence)
    - expect: Login is prevented
    - expect: Form properly validates required fields

#### 2.4. Login Button State Validation

**File:** `tests/login-validation/button-state.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed
    - expect: Login button is visible and clickable
  2. Verify login button behavior with empty fields
    - expect: Login button remains enabled (allows click for validation)
    - expect: No disabled state observed
  3. Enter only username and verify button state
    - expect: Login button remains enabled and functional
  4. Enter both username and password and verify button state
    - expect: Login button is enabled and ready to process login attempt

### 3. Password Security Suite

**Seed:** `tests/security-setup.spec.ts`

#### 3.1. Password Field Masking

**File:** `tests/login-security/password-masking.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is displayed with password field visible
  2. Enter password 'secret_sauce' in the password field
    - expect: Password characters are masked (displayed as dots or asterisks)
    - expect: Actual password text is not visible on screen
    - expect: Password field type is 'password' not 'text'
  3. Verify password masking with different password lengths
    - expect: All password characters remain masked regardless of length
    - expect: Security is maintained for password input
  4. Inspect password field attributes
    - expect: Password field has type='password' attribute
    - expect: Proper HTML security attributes are present

#### 3.2. Multiple Login Attempt Handling

**File:** `tests/login-security/multiple-attempts.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com login page
    - expect: Login page is ready for authentication attempts
  2. Attempt login with invalid credentials multiple times
    - expect: Each attempt shows appropriate error message
    - expect: System handles multiple failed attempts gracefully
    - expect: No account lockout mechanism observed for invalid credentials
  3. After failed attempts, try successful login
    - expect: Valid credentials still work after failed attempts
    - expect: No temporary account lockout for standard users

### 4. Session Management Suite

**Seed:** `tests/session-setup.spec.ts`

#### 4.1. Successful Logout Functionality

**File:** `tests/session-mgmt/successful-logout.spec.ts`

**Steps:**
  1. Navigate to saucedemo.com and login with valid credentials (standard_user/secret_sauce)
    - expect: User is successfully logged in
    - expect: Inventory page is displayed
    - expect: User session is active
  2. Click the hamburger menu (Open Menu) button in the header
    - expect: Menu opens with navigation options
    - expect: All Items, About, Logout, and Reset App State links are visible
    - expect: Close Menu button is available
  3. Click the 'Logout' link from the menu
    - expect: User is redirected to login page
    - expect: URL changes back to base saucedemo.com
    - expect: Login form is displayed again
    - expect: Session is terminated
  4. Verify session termination by attempting to navigate back to inventory
    - expect: Direct navigation to inventory.html redirects to login page
    - expect: User cannot access protected pages
    - expect: Session is properly cleared

#### 4.2. Logout Button Accessibility

**File:** `tests/session-mgmt/logout-accessibility.spec.ts`

**Steps:**
  1. Login and navigate to different pages (inventory, product details)
    - expect: User successfully navigates through different pages
    - expect: Hamburger menu is consistently available
  2. Verify logout accessibility from any page
    - expect: Hamburger menu is accessible from all pages
    - expect: Logout option is always available in the menu
    - expect: Menu functionality is consistent across pages
  3. Test logout from different page contexts
    - expect: Logout works from any page in the application
    - expect: Always redirects to login page regardless of current page

#### 4.3. Session Persistence During Navigation

**File:** `tests/session-mgmt/session-persistence.spec.ts`

**Steps:**
  1. Login with valid credentials and navigate through multiple pages
    - expect: User session remains active across page navigation
    - expect: No unexpected logouts occur
    - expect: User can freely browse the application
  2. Add items to cart and navigate between pages
    - expect: Cart contents persist during navigation
    - expect: Session maintains user state
    - expect: Application behavior remains consistent
  3. Verify session data integrity
    - expect: User information is maintained throughout session
    - expect: No data loss occurs during normal navigation

#### 4.4. Browser Back Button Security After Logout

**File:** `tests/session-mgmt/back-button-security.spec.ts`

**Steps:**
  1. Login, browse application, and logout normally
    - expect: Complete login/logout cycle works correctly
    - expect: User is on login page after logout
  2. Use browser back button to attempt returning to protected pages
    - expect: Browser back button does not return to previous user's data
    - expect: Protected pages are not accessible
    - expect: User is redirected to login page when accessing protected content
  3. Verify no cached sensitive data is accessible
    - expect: No previous user data is visible
    - expect: Session security is maintained
    - expect: Proper session cleanup occurred

### 5. User Types and Edge Cases Suite

**Seed:** `tests/edge-cases-setup.spec.ts`

#### 5.1. Different User Types Login Testing

**File:** `tests/edge-cases/user-types.spec.ts`

**Steps:**
  1. Test login with 'problem_user' account
    - expect: User can login successfully
    - expect: Application behavior may show specific problem user characteristics
    - expect: Session is established normally
  2. Test login with 'performance_glitch_user' account
    - expect: User can login successfully
    - expect: May experience performance delays as expected
    - expect: Login functionality works despite performance characteristics
  3. Test login with 'error_user' account
    - expect: User can login successfully
    - expect: Application may exhibit error-prone behavior as designed
    - expect: Basic login functionality is not impacted
  4. Test login with 'visual_user' account
    - expect: User can login successfully
    - expect: Visual differences in UI may be present
    - expect: Core login functionality remains intact

#### 5.2. Case Sensitivity Testing

**File:** `tests/edge-cases/case-sensitivity.spec.ts`

**Steps:**
  1. Test login with username in different case variations (STANDARD_USER, Standard_User)
    - expect: Case variations are rejected
    - expect: Login system is case sensitive
    - expect: Appropriate error message is displayed
  2. Test password case sensitivity with SECRET_SAUCE, Secret_Sauce
    - expect: Password is case sensitive
    - expect: Only exact case match works
    - expect: Invalid case shows appropriate error

#### 5.3. Special Characters and Input Validation

**File:** `tests/edge-cases/special-characters.spec.ts`

**Steps:**
  1. Test login with special characters in username field (@#$%^&*)
    - expect: Special characters are handled gracefully
    - expect: Appropriate validation or error handling occurs
    - expect: System doesn't crash or behave unexpectedly
  2. Test very long input strings in username and password fields
    - expect: System handles long inputs properly
    - expect: No buffer overflow or system issues
    - expect: Appropriate input length handling
  3. Test SQL injection attempts in login fields
    - expect: System prevents SQL injection attacks
    - expect: Input is properly sanitized
    - expect: Security measures are effective
