import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import sgMail from "@sendgrid/mail";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ 
      error: "Email and token are required",
      body: req.body 
    });
  }

  console.log("🧪 [TestEmail] Testing password reset email to:", email);

  try {
    // Set API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${token}`;
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM || "noreply@example.com",
      subject: "TEST - Reset Your Password",
      html: `
        <h2>TEST - Reset Your Password</h2>
        <p>This is a test email to verify password reset functionality.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 15 minutes.</p>
        <p><strong>This is a test email - ignore if you didn't request this.</strong></p>
      `,
      text: `
        TEST - Reset Your Password
        
        This is a test email to verify password reset functionality.
        
        Click the link below to reset your password:
        
        ${resetUrl}
        
        This link will expire in 15 minutes.
        
        This is a test email - ignore if you didn't request this.
      `
    };

    console.log("🧪 [TestEmail] Sending test email...");
    const [response] = await sgMail.send(msg);
    
    console.log("✅ [TestEmail] Test email sent successfully!");
    console.log("✅ [TestEmail] Response status:", response.statusCode);

    return res.json({
      success: true,
      message: "Test email sent successfully",
      statusCode: response.statusCode,
      resetUrl: resetUrl,
      email: email
    });

  } catch (error: any) {
    console.error("❌ [TestEmail] Failed to send test email:", error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.body || "No additional details",
      email: email,
      resetUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${token}`
    });
  }
};
