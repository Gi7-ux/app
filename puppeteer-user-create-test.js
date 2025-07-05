const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:5173');

    // Login as admin (adjust selectors and credentials as needed)
    await page.type('input[type=email]', 'admin@architex.co.za');
    await page.type('input[type=password]', 'YOUR_ADMIN_PASSWORD');
    await page.click('button[type=submit]');
    await page.waitForNavigation();

    // Go to User Management
    await page.waitForSelector('a[href*="user-management"], a:has-text("User Management")');
    await page.click('a[href*="user-management"], a:has-text("User Management")');

    // Wait for Add User button and click it
    await page.waitForSelector('button.create-btn');
    await page.click('button.create-btn');

    // Fill out the Add User form
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="email"]', 'testuser' + Date.now() + '@example.com');
    await page.type('input[name="password"]', 'TestPassword123!');
    await page.type('input[name="phone"]', '1234567890');
    await page.type('input[name="company"]', 'Test Company');
    await page.type('input[name="rate"]', '100');
    await page.type('input[name="skills"]', 'puppeteer,automation');
    // Select role if needed
    await page.select('select[name="role"]', 'freelancer');

    // Submit the form
    await page.click('button[type=submit]');

    // Wait for modal to close or for user to appear in table
    await page.waitForTimeout(2000);

    // Optionally, check for success message or new user in table
    // ...

    await browser.close();
})();
