/**
 * BackstopJS Engine Script - Login as Company Admin
 * Used for admin pages (company management, approvals settings, etc.)
 */

module.exports = async (page, scenario, viewport) => {
    console.log('SCENARIO > ' + scenario.label);
    console.log('Logging in as company admin...');

    // Navigate to login
    await page.goto('http://storefront:8000/br/conta/login', {
        waitUntil: 'networkidle0'
    });

    // Fill admin credentials
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.type('input[type="email"]', 'admin@yshsolar.com', { delay: 50 });
    await page.type('input[type="password"]', 'supersecret', { delay: 50 });

    // Submit form
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type="submit"]')
    ]);

    // Wait for auth to complete
    await page.waitForTimeout(1000);

    console.log('✅ Admin login completed');
};
