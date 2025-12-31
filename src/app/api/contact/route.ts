import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ContactRequest {
  name: string;
  email: string;
  message: string;
  authorEmails?: string; // Comma-separated author emails for blog-related questions
  blogTitle?: string; // Blog post title for blog-related questions
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateRequest(body: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body is missing or not an object"] };
  }
  
  const { name, email, message } = body as ContactRequest;
  
  if (typeof name !== "string" || name.trim().length === 0) {
    errors.push(`Invalid name: received "${name}" (type: ${typeof name})`);
  }
  
  if (typeof email !== "string") {
    errors.push(`Invalid email type: received "${email}" (type: ${typeof email})`);
  } else if (!validateEmail(email)) {
    errors.push(`Invalid email format: "${email}"`);
  }
  
  if (typeof message !== "string" || message.trim().length === 0) {
    errors.push(`Invalid message: received "${message}" (type: ${typeof message})`);
  }
  
  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  console.log("📧 [CONTACT] ========== NEW CONTACT REQUEST ==========");
  
  try {
    const body = await request.json();
    console.log("📧 [CONTACT] Request body received:", JSON.stringify(body, null, 2));

    // Validate request body
    const validation = validateRequest(body);
    console.log("📧 [CONTACT] Validation result:", validation);
    
    if (!validation.valid) {
      console.error("📧 [CONTACT] Validation failed:", validation.errors);
      return NextResponse.json(
        { 
          error: "Invalid request. Please provide name, email, and message.",
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { name, email, message, authorEmails, blogTitle } = body as ContactRequest;
    console.log("📧 [CONTACT] Extracted data - Name:", name, "| Email:", email, "| Message length:", message?.length);
    console.log("📧 [CONTACT] Blog context - Author Emails:", authorEmails || "N/A", "| Blog Title:", blogTitle || "N/A");

    // Check if this is a blog-related question (blogTitle is set when user selects "About this blog")
    const isBlogRelated = !!blogTitle;
    const hasAuthorEmails = !!(authorEmails && authorEmails.trim());
    console.log("📧 [CONTACT] Is blog-related question:", isBlogRelated);
    console.log("📧 [CONTACT] Has author emails:", hasAuthorEmails);

    // Check environment variables
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const defaultRecipientEmails = process.env.CONTACT_RECIPIENT_EMAILS;

    console.log("📧 [CONTACT] SMTP Config - Email:", smtpEmail ? `${smtpEmail.substring(0, 5)}...` : "NOT SET");
    console.log("📧 [CONTACT] SMTP Config - Password:", smtpPassword ? "SET (hidden)" : "NOT SET");
    console.log("📧 [CONTACT] SMTP Config - Default Recipients:", defaultRecipientEmails ? defaultRecipientEmails : "NOT SET");

    if (!smtpEmail || !smtpPassword) {
      console.error("📧 [CONTACT] ERROR: Missing SMTP configuration environment variables");
      console.error("📧 [CONTACT] - SMTP_EMAIL:", !!smtpEmail);
      console.error("📧 [CONTACT] - SMTP_PASSWORD:", !!smtpPassword);
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Determine recipients based on whether it's a blog-related question with author emails
    let recipients: string[];
    
    if (hasAuthorEmails && authorEmails) {
      // Blog-related question with author emails: send to author emails
      recipients = authorEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0 && validateEmail(email));
      
      console.log("📧 [CONTACT] Sending to blog author(s):", recipients.join(", "));
      
      if (recipients.length === 0) {
        console.error("📧 [CONTACT] No valid author emails found, falling back to default recipients");
        // Fall back to default recipients if author emails are invalid
        if (!defaultRecipientEmails) {
          return NextResponse.json(
            { error: "Server configuration error. Please try again later." },
            { status: 500 }
          );
        }
        recipients = defaultRecipientEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email.length > 0);
      }
    } else {
      // General question OR blog question without author emails: send to default recipients
      if (!defaultRecipientEmails) {
        console.error("📧 [CONTACT] ERROR: No default recipient emails configured");
        return NextResponse.json(
          { error: "Server configuration error. Please try again later." },
          { status: 500 }
        );
      }
      
      recipients = defaultRecipientEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
      
      if (isBlogRelated) {
        console.log("📧 [CONTACT] Blog-related question but no author emails, sending to default recipients with blog context");
      }
    }

    if (recipients.length === 0) {
      console.error("No valid recipient emails configured");
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Create transporter using Google SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    // Get current timestamp
    const timestamp = new Date().toLocaleString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Format the email content - minimal and clean design
    const blogContextHtml = isBlogRelated && blogTitle 
      ? `<p class="blog-context" style="font-size: 13px; color: #028bee; background: #f0f8ff; padding: 12px; border-left: 3px solid #028bee; margin-bottom: 16px;">
          <strong>Question about blog post:</strong><br>
          "${blogTitle}"
        </p>`
      : "";
    
    const blogContextText = isBlogRelated && blogTitle
      ? `[Question about blog post: "${blogTitle}"]\n\n`
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              color: #333;
              padding: 20px;
              margin: 0;
              line-height: 1.6;
              background: #fff;
            }
            .container {
              max-width: 560px;
              margin: 0 auto;
            }
            .message {
              font-size: 15px;
              color: #333;
              padding: 16px 0;
              border-bottom: 1px solid #eee;
              margin-bottom: 16px;
              white-space: pre-wrap;
            }
            .meta {
              font-size: 13px;
              color: #666;
            }
            .meta a {
              color: #0066cc;
              text-decoration: none;
            }
            .footer {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${blogContextHtml}
            <p class="message">${message.replace(/\n/g, "<br>")}</p>
            
            <p class="meta">
              <strong>${name}</strong> &lt;<a href="mailto:${email}">${email}</a>&gt;<br>
              ${timestamp}
            </p>
            
            <p class="footer">
              Received via Tokamak zk-EVM ${isBlogRelated ? "Blog" : "Support"}
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
${blogContextText}${message}

—
${name} <${email}>
${timestamp}

Received via Tokamak zk-EVM ${isBlogRelated ? "Blog" : "Support"}
    `.trim();

    // Determine subject line based on context
    const subject = isBlogRelated && blogTitle
      ? `Question about "${blogTitle}" from ${name}`
      : `${name} sent you a message`;
    
    const fromName = isBlogRelated 
      ? `${name} via Tokamak Blog`
      : `${name} via Tokamak Support`;

    // Send email to all recipients
    console.log("📧 [CONTACT] Sending email to:", recipients.join(", "));
    console.log("📧 [CONTACT] Subject:", subject);
    
    const result = await transporter.sendMail({
      from: `"${fromName}" <${smtpEmail}>`,
      to: recipients.join(", "),
      replyTo: email,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("📧 [CONTACT] ✅ Email sent successfully!");
    console.log("📧 [CONTACT] Message ID:", result.messageId);
    console.log("📧 [CONTACT] ==========================================");

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("📧 [CONTACT] ❌ ERROR sending contact email:", error);
    console.error("📧 [CONTACT] Error details:", error instanceof Error ? error.message : String(error));
    console.error("📧 [CONTACT] ==========================================");
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}

