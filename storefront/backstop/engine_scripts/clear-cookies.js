/**
 * BackstopJS Engine Script - Clear Cookies
 * Used to test consent banner on fresh visits
 */

module.exports = async (page, scenario, viewport) => {
    console.log('SCENARIO > ' + scenario.label);
    console.log('Clearing cookies for fresh consent banner test...');

    // Clear all cookies
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');

    console.log('✅ Cookies cleared');
};
