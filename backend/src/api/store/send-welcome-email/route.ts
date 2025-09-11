import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import sgMail from "@sendgrid/mail";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email, firstName, lastName, companyName } = req.body as { 
    email: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };

  if (!email) {
    return res.status(400).json({ 
      error: "Email is required"
    });
  }

  const normalizedEmail = email.toLowerCase();
  const customerFirstName = firstName || "Customer";
  const customerLastName = lastName || "";
  const customerCompanyName = companyName || "";

  const templateId = process.env.SENDGRID_CUSTOMER_CONFIRMATION_TEMPLATE;
  
  if (!templateId) {
    return res.status(500).json({
      success: false,
      error: "Email template not configured. Please contact support."
    });
  }

  try {
    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
    
    const templateData = {
      first_name: customerFirstName,
      last_name: customerLastName,
      customer_name: `${customerFirstName} ${customerLastName}`.trim() || "Customer",
      customer_email: normalizedEmail,
      company_name: customerCompanyName,
      email: normalizedEmail,
      subject: "Welcome to Our Platform",
      login_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/account`,
    };
    
    const msg = {
      to: normalizedEmail,
      from: process.env.SENDGRID_FROM || "noreply@example.com",
      templateId: templateId,
      dynamicTemplateData: templateData,
    };
    
    // Try primary SendGrid method with template
    try {
      const [response] = await sgMail.send(msg);

      return res.json({
        success: true,
        message: "Welcome email sent successfully"
      });
      
    } catch (sendGridError: any) {
      console.error("[WELCOME EMAIL] SendGrid primary error:", sendGridError);
      
      // Fallback: Direct HTTP request to SendGrid API with template  
      const fallbackResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: normalizedEmail }],
            dynamic_template_data: templateData
          }],
          from: { 
            email: process.env.SENDGRID_FROM || "noreply@example.com",
            name: "Support Team"
          },
          template_id: templateId
        })
      });

      if (fallbackResponse.ok || fallbackResponse.status === 202) {
        return res.json({
          success: true,
          message: "Welcome email sent successfully"
        });
      } else {
        const errorText = await fallbackResponse.text();
        console.error("[WELCOME EMAIL] Fallback error:", errorText);
        
        // Last resort: Try with inline HTML if template fails
        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Our Platform!</h2>
            <p>Hello ${customerFirstName},</p>
            <p>Thank you for creating an account with us! We're excited to have you on board.</p>
            ${customerCompanyName ? `<p>Your company <strong>${customerCompanyName}</strong> has been successfully registered.</p>` : ''}
            <p>You can now access your account and start exploring our services.</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"}/account" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Access Your Account
              </a>
            </div>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The Team</p>
          </div>
        `;
        
        const inlineResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: normalizedEmail }]
            }],
            from: { 
              email: process.env.SENDGRID_FROM || "noreply@example.com",
              name: "Support Team"
            },
            subject: "Welcome to Our Platform!",
            content: [{
              type: 'text/html',
              value: htmlContent
            }]
          })
        });
        
        if (inlineResponse.ok || inlineResponse.status === 202) {
          return res.json({
            success: true,
            message: "Welcome email sent successfully"
          });
        }
        
        throw new Error(`All email methods failed: ${errorText}`);
      }
    }

  } catch (error: any) {
    console.error("[WELCOME EMAIL] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send welcome email",
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};