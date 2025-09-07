// Test if the email service is working when the backend is running
const axios = require('axios');

async function testEmailService() {
  try {
    console.log('Testing email service through backend...');
    
    // Test the email configuration endpoint
    const response = await axios.get('http://localhost:9000/admin/test-email', {
      timeout: 5000,
    });
    
    console.log('✅ Email service test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Email service test failed with status:', error.response.status);
      console.log('Response:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is not running on localhost:9000');
    } else {
      console.log('❌ Email service test failed:', error.message);
    }
  }
}

testEmailService();
