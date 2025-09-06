// Test script to debug order email sending
const EmailService = require("./dist/services/email.service.js").default;

async function testOrderEmail() {
  console.log("========== TESTING ORDER EMAIL ==========");
  
  // Initialize email service
  const emailService = new EmailService();
  
  // Test data
  const testData = {
    to: "test@example.com", // Change this to your email
    order: {
      id: "test-order-123",
      display_id: "#1001",
      total: 10000, // $100.00
      currency_code: "usd",
      items: [
        {
          title: "Test Product",
          quantity: 2,
          unit_price: 5000 // $50.00
        }
      ],
      shipping_address: {
        first_name: "John",
        last_name: "Doe",
        address_1: "123 Test St",
        city: "Test City",
        province: "TC",
        postal_code: "12345",
        country_code: "us"
      },
      billing_address: {
        first_name: "John",
        last_name: "Doe",
        address_1: "123 Test St",
        city: "Test City",
        province: "TC",
        postal_code: "12345",
        country_code: "us"
      }
    },
    customer: {
      id: "cust-123",
      email: "test@example.com",
      first_name: "John",
      last_name: "Doe"
    }
  };
  
  console.log("Sending test email to:", testData.to);
  console.log("Order ID:", testData.order.display_id);
  
  try {
    const result = await emailService.sendOrderPlacedEmail(testData);
    console.log("Email send result:", result);
    if (result) {
      console.log("✅ Email sent successfully!");
    } else {
      console.log("❌ Email failed to send (returned false)");
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
  
  console.log("========== TEST COMPLETE ==========");
}

// Run the test
testOrderEmail().catch(console.error);