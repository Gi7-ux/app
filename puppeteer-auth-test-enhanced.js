import puppeteer from 'puppeteer';

async function runEnhancedAuthTest() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Initialize MCP browser tools
    await page.evaluateOnNewDocument(() => {
        window.__MCP_BROWSER_TOOLS__ = true;
    });

    // Enable request interception for network monitoring
    await page.setRequestInterception(true);
    page.on('request', request => {
        request.continue();
    });

    // Track console errors
    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    await page.goto('http://localhost:5174');
    
    // 1. Test login flow
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@architex.co.za');
    await page.type('input[type="password"]', 'password');
    await page.click('button.login-btn');
    
    // Wait for auth completion
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 2. Verify dashboard redirect
    if (!page.url().includes('/dashboard')) {
        throw new Error('Failed to redirect to dashboard after login');
    }

    // 3. Validate token storage
    const jwtToken = await page.evaluate(() => {
        return localStorage.getItem('access_token');
    });
    if (!jwtToken) throw new Error('No JWT token found in localStorage');

    // 4. Test API request with token
    const apiResponse = await page.evaluate(async (token) => {
        return fetch('http://localhost:8000/api/users/read_one.php', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => res.json());
    }, jwtToken);
    
    if (!apiResponse) throw new Error('API request failed with valid token');

    // 5. Test token refresh flow simulation
    await page.evaluate(() => {
        // Simulate expired token
        localStorage.setItem('access_token', 'expired_token');
        sessionStorage.setItem('refresh_token', 'valid_refresh_token');
        
        // Mock refresh by making API call
        return fetch('http://localhost:8000/api/auth/refresh.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                refresh_token: sessionStorage.getItem('refresh_token')
            })
        }).then(res => res.json())
          .then(data => {
              if (data.token) {
                  localStorage.setItem('access_token', data.token);
              }
              return data;
          });
    });

    const newToken = await page.evaluate(() => localStorage.getItem('access_token'));
    if (!newToken || newToken === 'expired_token') {
        throw new Error('Token refresh failed - no new token received');
    }

    // 6. Run MCP audits
    const accessibilityReport = await page.evaluate(() => {
        return window.__MCP_BROWSER_TOOLS__.runAccessibilityAudit();
    });

    if (accessibilityReport.errors.length > 0) {
        console.warn('Accessibility issues found:', accessibilityReport.errors);
    }

    // 7. Check for console errors
    if (consoleErrors.length > 0) {
        throw new Error(`Console errors during auth flow: ${consoleErrors.join('\n')}`);
    }

    await browser.close();
    return 'Auth test completed successfully with all validations';
}

runEnhancedAuthTest().then(console.log).catch(console.error);