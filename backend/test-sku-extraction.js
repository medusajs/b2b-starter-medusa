// Test SKU extraction
const tests = [
    'images\\NEOSOLAR-INVERTERS\\neosolar_inverters_20566.jpg',
    'images/ODEX-INVERTERS/112369.jpg',
    '/static/images/test_12345.png',
    'test.jpg',
    'product_987_abc.png'
];

function extractSku(imagePath) {
    // Match any sequence of digits immediately before file extension
    const match = imagePath.match(/(\d+)\.(jpg|png|webp|jpeg)$/i);
    return match ? match[1] : null;
}

tests.forEach(test => {
    const sku = extractSku(test);
    console.log(`Image: ${test}`);
    console.log(`SKU: ${sku || 'NOT FOUND'}`);
    console.log('---');
});
