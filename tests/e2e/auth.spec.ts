import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title
    await expect(page).toHaveTitle(/Melioro AI/);
    
    // Check login form elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    // Click sign in without filling form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation messages
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    
    // Click signup link
    await page.getByRole('link', { name: /sign up/i }).click();
    
    // Verify navigation
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in valid credentials (use test user)
    await page.getByLabel(/email/i).fill('test@melioro.ai');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should show forgot password page', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.getByRole('link', { name: /forgot password/i }).click();
    
    // Verify navigation
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible();
  });
});

test.describe('Signup', () => {
  test('should display signup form', async ({ page }) => {
    await page.goto('/signup');
    
    // Check form elements
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill form with weak password
    await page.getByLabel(/email/i).fill('newuser@example.com');
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/company name/i).fill('Acme Corp');
    await page.getByLabel(/^password$/i).fill('weak');
    
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for password strength error
    await expect(page.getByText(/password must be at least/i)).toBeVisible();
  });

  test('should successfully register new user', async ({ page }) => {
    await page.goto('/signup');
    
    // Generate unique email
    const timestamp = Date.now();
    const email = `newuser${timestamp}@example.com`;
    
    // Fill form
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/company name/i).fill('Acme Corp');
    await page.getByLabel(/^password$/i).fill('SecurePass123!');
    await page.getByLabel(/confirm password/i).fill('SecurePass123!');
    
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Verify successful registration
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each dashboard test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@melioro.ai');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display dashboard with KPI cards', async ({ page }) => {
    // Check for KPI cards
    await expect(page.getByText(/meetings booked/i)).toBeVisible();
    await expect(page.getByText(/pipeline created/i)).toBeVisible();
    await expect(page.getByText(/revenue/i)).toBeVisible();
  });

  test('should display navigation sidebar', async ({ page }) => {
    // Check navigation items
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /prospects/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /campaigns/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
  });

  test('should navigate to prospects page', async ({ page }) => {
    await page.getByRole('link', { name: /prospects/i }).click();
    
    await expect(page).toHaveURL(/\/prospects/);
    await expect(page.getByRole('heading', { name: /prospects/i })).toBeVisible();
  });

  test('should navigate to campaigns page', async ({ page }) => {
    await page.getByRole('link', { name: /campaigns/i }).click();
    
    await expect(page).toHaveURL(/\/campaigns/);
    await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible();
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.getByRole('link', { name: /analytics/i }).click();
    
    await expect(page).toHaveURL(/\/analytics/);
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
  });

  test('should toggle dark/light mode', async ({ page }) => {
    // Get initial theme
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme');
    
    // Toggle theme
    await page.getByRole('button', { name: /toggle theme/i }).click();
    
    // Verify theme changed
    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should logout successfully', async ({ page }) => {
    // Click user menu
    await page.getByRole('button', { name: /user menu/i }).click();
    
    // Click logout
    await page.getByRole('menuitem', { name: /logout/i }).click();
    
    // Verify logged out
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Prospects', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to prospects
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@melioro.ai');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: /prospects/i }).click();
    await expect(page).toHaveURL(/\/prospects/);
  });

  test('should display prospects list', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText(/prospect/i)).toBeVisible();
  });

  test('should filter prospects by stage', async ({ page }) => {
    // Open filter dropdown
    await page.getByRole('button', { name: /filter/i }).click();
    
    // Select stage filter
    await page.getByRole('option', { name: /qualified/i }).click();
    
    // Verify filter applied
    await expect(page.getByText(/qualified/i)).toBeVisible();
  });

  test('should search prospects', async ({ page }) => {
    // Type in search box
    await page.getByPlaceholder(/search/i).fill('tech');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Verify search results
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('should open add prospect dialog', async ({ page }) => {
    // Click add button
    await page.getByRole('button', { name: /add prospect/i }).click();
    
    // Verify dialog opened
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /add prospect/i })).toBeVisible();
  });
});

test.describe('Campaigns', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to campaigns
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@melioro.ai');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.getByRole('link', { name: /campaigns/i }).click();
    await expect(page).toHaveURL(/\/campaigns/);
  });

  test('should display campaigns list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible();
  });

  test('should create new campaign', async ({ page }) => {
    // Click create button
    await page.getByRole('button', { name: /create campaign/i }).click();
    
    // Verify dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Fill form
    await page.getByLabel(/campaign name/i).fill('Test Campaign');
    await page.getByLabel(/type/i).click();
    await page.getByRole('option', { name: /email/i }).click();
    
    // Submit
    await page.getByRole('button', { name: /create/i }).click();
    
    // Verify campaign created
    await expect(page.getByText(/test campaign/i)).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check mobile menu exists
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    
    // Open mobile menu
    await page.getByRole('button', { name: /menu/i }).click();
    
    // Verify navigation visible
    await expect(page.getByRole('navigation')).toBeVisible();
  });
});