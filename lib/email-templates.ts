/**
 * Email templates for various use cases
 * Supports variables: {name}, {email}, {blogTitle}, {blogUrl}, {jobTitle}, {companyName}, etc.
 */

export type EmailTemplateType =
  | "welcome"
  | "update"
  | "job-offer"
  | "blog-post"
  | "weekly-summary"
  | "bug-fix";

export interface EmailTemplate {
  id: EmailTemplateType;
  name: string;
  description: string;
  subject: string;
  html: string;
  variables: string[];
}

function getEmailBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SimpleResu.me</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">
                SimpleResu<span style="color: #d1fae5;">.me</span>
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                Your Professional Resume Builder
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 10px 0; color: #6b6b6b; font-size: 14px;">
                Made with ❤️ in India
              </p>
              <p style="margin: 0 0 15px 0; color: #6b6b6b; font-size: 12px;">
                <a href="https://www.linkedin.com/in/siddhucse/" style="color: #10b981; text-decoration: none; margin: 0 10px;">LinkedIn</a>
                <span style="color: #ccc;">|</span>
                <a href="https://github.com/vydyas/Free-Resume-Builder-Simple-Resume" style="color: #10b981; text-decoration: none; margin: 0 10px;">GitHub</a>
                <span style="color: #ccc;">|</span>
                <a href="https://simpleresu.me/blog" style="color: #10b981; text-decoration: none; margin: 0 10px;">Blog</a>
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
                  <a href="https://simpleresu.me/settings" style="color: #10b981; text-decoration: underline;">
                    Manage email preferences
                  </a>
                  <span style="color: #ccc; margin: 0 8px;">|</span>
                  <a href="https://simpleresu.me/settings" style="color: #10b981; text-decoration: underline;">
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

export const emailTemplates: Record<EmailTemplateType, EmailTemplate> = {
  welcome: {
    id: "welcome",
    name: "Welcome Email",
    description: "Welcome new users to SimpleResu.me",
    subject: "Welcome to SimpleResu.me! 🎉",
    variables: ["name", "email"],
    html: getEmailBaseTemplate(`
      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
        Welcome, {name}! 👋
      </h2>
      
      <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        We're thrilled to have you join SimpleResu.me! You're now part of a community of builders, thinkers, developers, hackers, and tinkerers who are creating standout resumes.
      </p>
      
      <p style="margin: 0 0 30px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        Get started by creating your first professional resume in just a few minutes:
      </p>
      
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
        <tr>
          <td align="center">
            <a href="https://simpleresu.me/resume-builder" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
              Create Your Resume →
            </a>
          </td>
        </tr>
      </table>
      
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
        <a href="mailto:support@simpleresu.me" style="color: #10b981; text-decoration: none;">support@simpleresu.me</a>
      </p>
    `),
  },

  update: {
    id: "update",
    name: "Product Update",
    description: "Share product updates and new features",
    subject: "Exciting Updates from SimpleResu.me! 🚀",
    variables: ["name", "updateTitle", "updateContent", "ctaText", "ctaUrl"],
    html: getEmailBaseTemplate(`
      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
        Hi {name}! 👋
      </h2>
      
      <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        We have some exciting updates to share with you!
      </p>
      
      <div style="margin: 30px 0; padding: 30px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
          {updateTitle}
        </h3>
        <div style="color: #4a4a4a; font-size: 15px; line-height: 1.8;">
          {updateContent}
        </div>
      </div>
      
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
        <tr>
          <td align="center">
            <a href="{ctaUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
              {ctaText} →
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
        Thank you for being part of the SimpleResu.me community!
      </p>
    `),
  },

  "job-offer": {
    id: "job-offer",
    name: "Job Opportunities",
    description: "Share job opportunities and career tips",
    subject: "Exciting Job Opportunities for You! 💼",
    variables: ["name", "jobTitle", "companyName", "jobDescription", "applyUrl"],
    html: getEmailBaseTemplate(`
      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
        Hi {name}! 👋
      </h2>
      
      <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        We found a great opportunity that might interest you!
      </p>
      
      <div style="margin: 30px 0; padding: 30px; background-color: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">
          {jobTitle}
        </h3>
        <p style="margin: 0 0 15px 0; color: #64748b; font-size: 16px; font-weight: 500;">
          {companyName}
        </p>
        <div style="color: #4a4a4a; font-size: 15px; line-height: 1.8; margin-bottom: 20px;">
          {jobDescription}
        </div>
        <a href="{applyUrl}" style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
          Apply Now →
        </a>
      </div>
      
      <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
        Don't forget to update your resume on SimpleResu.me before applying!
      </p>
    `),
  },

  "blog-post": {
    id: "blog-post",
    name: "New Blog Post",
    description: "Notify users about new blog posts",
    subject: "New Blog Post: {blogTitle} 📝",
    variables: ["name", "blogTitle", "blogExcerpt", "blogUrl"],
    html: getEmailBaseTemplate(`
      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
        Hi {name}! 👋
      </h2>
      
      <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        We just published a new blog post that you might find helpful:
      </p>
      
      <div style="margin: 30px 0; padding: 30px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">
          {blogTitle}
        </h3>
        <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 15px; line-height: 1.8;">
          {blogExcerpt}
        </p>
        <a href="{blogUrl}" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
          Read Article →
        </a>
      </div>
      
      <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
        Check out more helpful tips on our <a href="https://simpleresu.me/blog" style="color: #10b981; text-decoration: none;">blog</a>!
      </p>
    `),
  },

  "weekly-summary": {
    id: "weekly-summary",
    name: "Weekly Summary",
    description: "Weekly digest of updates and tips",
    subject: "Your Weekly Summary from SimpleResu.me 📊",
    variables: ["name", "summaryContent"],
    html: getEmailBaseTemplate(`
      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
        Hi {name}! 👋
      </h2>
      
      <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        Here's your weekly summary from SimpleResu.me:
      </p>
      
      <div style="margin: 30px 0; padding: 30px; background-color: #f8f9fa; border-radius: 8px;">
        <div style="color: #4a4a4a; font-size: 15px; line-height: 1.8;">
          {summaryContent}
        </div>
      </div>
      
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
        <tr>
          <td align="center">
            <a href="https://simpleresu.me/resume-builder" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
              Update Your Resume →
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
        Have a great week!
      </p>
    `),
  },

  "bug-fix": {
    id: "bug-fix",
    name: "Bug Fix Announcement",
    description: "Notify users about important bug fixes",
    subject: "We Fixed It! Print Feature Now Working 🔧",
    variables: ["name"],
    html: getEmailBaseTemplate(`
      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
        Hi {name}! 👋
      </h2>
      
      <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        We wanted to reach out personally to let you know about an important fix we've made.
      </p>
      
      <div style="margin: 30px 0; padding: 30px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
          🔧 Print Feature Bug Fixed
        </h3>
        <p style="margin: 0; color: #4a4a4a; font-size: 15px; line-height: 1.8;">
          We recently discovered that the print/download feature wasn't working correctly on desktop browsers. We're really sorry for any inconvenience this may have caused you.
        </p>
      </div>
      
      <div style="margin: 30px 0; padding: 30px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
          ✅ What We Fixed
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #4a4a4a; font-size: 15px; line-height: 1.8;">
          <li style="margin-bottom: 10px;">Print preview now shows your resume correctly on desktop</li>
          <li style="margin-bottom: 10px;">PDF downloads work seamlessly across all devices</li>
          <li style="margin-bottom: 0;">Mobile and tablet printing has been improved</li>
        </ul>
      </div>
      
      <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
        <strong>You can now use the print feature without any issues!</strong> Go ahead and download your polished resume.
      </p>
      
      <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
        <tr>
          <td align="center">
            <a href="https://simpleresu.me/resume-builder" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
              Try It Now →
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
        Thank you for your patience and for being part of SimpleResu.me. We're committed to making your resume-building experience as smooth as possible.
      </p>
      
      <p style="margin: 15px 0 0 0; color: #4a4a4a; font-size: 14px; line-height: 1.6;">
        If you encounter any other issues, please don't hesitate to reach out!
      </p>
    `),
  },
};

/**
 * Replace template variables with actual values
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

/**
 * Get all available templates
 */
export function getAllTemplates(): EmailTemplate[] {
  return Object.values(emailTemplates);
}

/**
 * Get a specific template by ID
 */
export function getTemplate(id: EmailTemplateType): EmailTemplate | undefined {
  return emailTemplates[id];
}


