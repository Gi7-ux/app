// playwright-login.spec.js
import { test, expect } from '@playwright/test';

test('Login flow works', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.fill('input[name="email"]', 'admin@architex.co.za');
  await page.fill('input[name="password"]', 'your_password_here'); // Replace with actual password
  await page.click('button[type="submit"]');
  // Wait for navigation or dashboard element
  await expect(page.locator('.login-card')).not.toBeVisible();
  // Optionally check for dashboard or success indicator
  // Adjust selector below to match your dashboard/main page
  // await expect(page.locator('.dashboard-container')).toBeVisible();
});
