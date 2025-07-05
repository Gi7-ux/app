import puppeteer from 'puppeteer';

async function runAuthTest() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:5174');
    
    // Capture network activity
    page.on('response', async (response) => {
        if (response.url() === 'http://localhost:8000/api/auth/login.php') {
            console.log(await response.text());
        }
    });
    
    // Fill login form and submit
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@architex.co.za');
    await page.type('input[type="password"]', 'password');
    await page.click('button.login-btn');
    
    // Wait for authentication completion 
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Verify if dashboard dashboard page is loaded
    if (page.url().includes('/dashboard')) {
        console.log('User is redirected to the dashboard page after login.');
    } else {
        console.log('User not redirected to the dashboard page.');
    }
    
    // Check for presence of JWT token in storage
    const jwtToken = await page.evaluate(() => {
        return window.localStorage.getItem('access_token');
    });

    if (jwtToken) {
        console.log('JWT token found in local storage:', jwtToken);
    } else {
        console.log('No JWT token found in local storage.');
    }
    
    // Test subsequent API requests 
    page.setExtraHTTPHeaders({
        Authorization: `Bearer ${jwtToken}`
    });

    try {
        const response = await page.goto('http://localhost:5174/api/users/read_one.php');

        if (response.status() === 200) {
            console.log('Successful API request with JWT token.');
        } else {
            console.log('Failed API request with JWT token.');
        }
    } catch (error) {
        console.log('API request failed:', error);
    }

    await browser.close();
}

runAuthTest();