import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import sgMail from "@sendgrid/mail";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body;

  console.log("🚨 [STORE API] Password reset request for email:", email);

  if (!email) {
    console.log("❌ [STORE API] Missing email");
    return res.status(400).json({ 
      error: "Email is required"
    });
  }

  try {
    // STEP 1: Generate the reset token by calling Medusa's reset password endpoint
    console.log("🚨 [STORE API] Step 1: Generating reset token...");
    const resetResponse = await fetch(`${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/auth/customer/emailpass/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: email,
      })
    });

    if (!resetResponse.ok) {
      const errorData = await resetResponse.json();
      console.log("❌ [STORE API] Failed to generate reset token:", errorData);
      return res.status(500).json({
        success: false,
        error: "Failed to generate reset token"
      });
    }

    console.log("✅ [STORE API] Reset token generated successfully");

    // STEP 2: Generate a simple token for the reset URL
    const token = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log("🚨 [STORE API] Step 2: Generated token:", token);

    // STEP 3: Send the email immediately
    console.log("🚨 [STORE API] Step 3: Sending email...");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/reset-password?token=${token}`;
    
    console.log("📧 [STORE API] Sending email to:", email);
    console.log("📧 [STORE API] Reset URL:", resetUrl);
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM || "noreply@example.com",
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;">${resetUrl}</p>
          <p><strong>This link will expire in 15 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
      text: `
        Reset Your Password
        
        Hello,
        
        You requested a password reset for your account. Click the link below to reset your password:
        
        ${resetUrl}
        
        This link will expire in 15 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        This is an automated message. Please do not reply to this email.
      `
    };
    
    const [response] = await sgMail.send(msg);

    console.log("✅ [STORE API] Email sent successfully!");
    console.log("✅ [STORE API] Status code:", response.statusCode);

    return res.json({
      success: true,
      message: "Password reset email sent successfully",
      statusCode: response.statusCode,
      messageId: response.headers?.['x-message-id']
    });

  } catch (error: any) {
    console.error("❌ [STORE API] Failed to send email:", error.message);
    console.error("❌ [STORE API] Error details:", error.response?.body);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.body || "No additional details"
    });
  }
};
