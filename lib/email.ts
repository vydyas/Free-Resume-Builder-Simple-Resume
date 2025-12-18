/**
 * Email service for sending transactional emails
 * Uses Resend API for email delivery
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.FROM_EMAIL || "SimpleResu.me <welcome@simpleresu.me>";

if (!RESEND_API_KEY) {
  console.warn("[Email] RESEND_API_KEY not configured in environment variables");
}

interface WelcomeEmailData {
  email: string;
  name?: string;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail({
  email,
  name,
}: WelcomeEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email send");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: "Welcome to SimpleResu.me! 🎉",
        html: getWelcomeEmailTemplate(name || "there"),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Failed to send welcome email:", error);
      return false;
    }

    console.log(`[Email] Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    return false;
  }
}

/**
 * Welcome email HTML template
 */
function getWelcomeEmailTemplate(name: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SimpleResu.me</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; font-family: 'Great Vibes', cursive;">
                SimpleResu<span style="color: #e0e0e0;">.me</span>
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Your Professional Resume Builder
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                Welcome, ${name}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you join SimpleResu.me! You're now part of a community of builders, thinkers, developers, hackers, and tinkerers who are creating standout resumes.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Get started by creating your first professional resume in just a few minutes:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://simpleresu.me/resume-builder" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Create Your Resume →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Features -->
              <div style="margin: 40px 0; padding: 30px; background-color: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                  What you can do:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #4a4a4a; font-size: 15px; line-height: 1.8;">
                  <li style="margin-bottom: 10px;">✨ Create professional, ATS-friendly resumes</li>
                  <li style="margin-bottom: 10px;">🎨 Choose from multiple beautiful templates</li>
                  <li style="margin-bottom: 10px;">📄 Export to PDF with one click</li>
                  <li style="margin-bottom: 10px;">🔗 Import data from LinkedIn</li>
                  <li style="margin-bottom: 0;">📝 Blog with expert resume tips</li>
                </ul>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
                If you have any questions or need help, feel free to reach out to us at 
                <a href="mailto:support@simpleresu.me" style="color: #667eea; text-decoration: none;">support@simpleresu.me</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #6b6b6b; font-size: 14px;">
                Made with ❤️ in India
              </p>
              <p style="margin: 0 0 15px 0; color: #6b6b6b; font-size: 12px;">
                <a href="https://www.linkedin.com/in/siddhucse/" style="color: #667eea; text-decoration: none; margin: 0 10px;">LinkedIn</a>
                <span style="color: #ccc;">|</span>
                <a href="https://github.com/vydyas/Free-Resume-Builder-Simple-Resume" style="color: #667eea; text-decoration: none; margin: 0 10px;">GitHub</a>
              </p>
              <p style="margin: 0; color: #9b9b9b; font-size: 11px;">
                © ${new Date().getFullYear()} SimpleResu.me. All rights reserved.
              </p>
              <!-- Unsubscribe Section -->
              <div style="margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0 0 10px 0; color: #6b6b6b; font-size: 12px; line-height: 1.6;">
                  You're receiving this email because you're subscribed to SimpleResu.me updates.
                </p>
                <p style="margin: 0; color: #6b6b6b; font-size: 12px;">
                  <a href="https://simpleresu.me/settings" style="color: #667eea; text-decoration: underline;">
                    Manage email preferences
                  </a>
                  <span style="color: #ccc; margin: 0 8px;">|</span>
                  <a href="https://simpleresu.me/settings" style="color: #667eea; text-decoration: underline;">
                    Unsubscribe from emails
                  </a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send custom email to a user
 */
export async function sendCustomEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    return {
      success: false,
      error: "RESEND_API_KEY not configured",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Email] Failed to send custom email:", error);
      return {
        success: false,
        error: error || "Failed to send email",
      };
    }

    await response.json();
    console.log(`[Email] Custom email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error sending custom email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}




