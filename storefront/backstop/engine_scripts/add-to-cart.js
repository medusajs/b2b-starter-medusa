/**
 * BackstopJS Engine Script - Add to Cart
 * Used to test cart with items
 */

module.exports = async (page, scenario, viewport) => {
    console.log('SCENARIO > ' + scenario.label);
    console.log('Adding items to cart...');

    // Navigate to a product
    await page.goto('http://storefront:8000/br/produtos/painel-solar-550w', {
        waitUntil: 'networkidle0'
    });

    // Wait for product to load
    await page.waitForSelector('[data-testid="add-to-cart-btn"]', { timeout: 5000 });

    // Click add to cart
    await page.click('[data-testid="add-to-cart-btn"]');

    // Wait for cart to update
    await page.waitForTimeout(2000);

    console.log('✅ Items added to cart');
};
