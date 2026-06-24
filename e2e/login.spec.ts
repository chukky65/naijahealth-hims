import { test, expect } from '@playwright/test';

test.describe('Login & Role-Based Access Control', () => {
  test('Admin user can login and see all dashboard navigation items', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Make sure we are on the login page
    await expect(page.locator('text=Sign in to your account')).toBeVisible();

    // Select the Admin user from the dropdown
    // The option value for Admin is '4' based on MOCK_USERS
    await page.locator('select#user-select').selectOption('4');

    // The password input comes pre-filled with 'password123' based on Login.tsx,
    // but let's ensure it's filled just in case
    await page.locator('input#password').fill('password123');

    // Submit the form
    await page.locator('button[type="submit"]').click();

    // Wait for login to complete and navigate to dashboard
    // The dashboard has a specific text "N-HIMS Elite" in the sidebar
    await expect(page.locator('text=N-HIMS Elite')).toBeVisible({ timeout: 5000 });
    
    // Verify that the user is logged in as Admin and sees Admin-specific items
    // Admin should see 'Dashboard', 'Appointments', 'Billing', 'Departments', 'Pharmacy', 'Patients', 'Staff', 'AI & Analytics', 'Settings'
    const expectedItems = [
      'Dashboard',
      'Appointments',
      'Billing',
      'Departments',
      'Pharmacy',
      'Patients',
      'Staff',
      'AI & Analytics',
      'Settings',
    ];

    for (const item of expectedItems) {
      await expect(page.locator(`nav >> text=${item}`)).toBeVisible();
    }
  });
});
