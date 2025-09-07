require('dotenv').config();

console.log('Environment Variables Test:');
console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('SENDGRID_API_KEY starts with SG:', process.env.SENDGRID_API_KEY?.startsWith('SG.'));
console.log('SENDGRID_FROM:', process.env.SENDGRID_FROM);
console.log('SENDGRID_ORDER_PLACED_TEMPLATE:', process.env.SENDGRID_ORDER_PLACED_TEMPLATE);

// Test EmailService
const EmailService = require('./src/services/email.service.ts').default;
console.log('\nTesting EmailService initialization...');
try {
  const emailService = new EmailService();
  console.log('✅ EmailService initialized successfully');
} catch (error) {
  console.log('❌ EmailService initialization failed:', error.message);
}
