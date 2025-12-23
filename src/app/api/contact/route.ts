import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ContactRequest {
  name: string;
  email: string;
  message: string;
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

    const { name, email, message } = body as ContactRequest;
    console.log("📧 [CONTACT] Extracted data - Name:", name, "| Email:", email, "| Message length:", message?.length);

    // Check environment variables
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const recipientEmails = process.env.CONTACT_RECIPIENT_EMAILS;

    console.log("📧 [CONTACT] SMTP Config - Email:", smtpEmail ? `${smtpEmail.substring(0, 5)}...` : "NOT SET");
    console.log("📧 [CONTACT] SMTP Config - Password:", smtpPassword ? "SET (hidden)" : "NOT SET");
    console.log("📧 [CONTACT] SMTP Config - Recipients:", recipientEmails ? recipientEmails : "NOT SET");

    if (!smtpEmail || !smtpPassword || !recipientEmails) {
      console.error("📧 [CONTACT] ERROR: Missing SMTP configuration environment variables");
      console.error("📧 [CONTACT] - SMTP_EMAIL:", !!smtpEmail);
      console.error("📧 [CONTACT] - SMTP_PASSWORD:", !!smtpPassword);
      console.error("📧 [CONTACT] - CONTACT_RECIPIENT_EMAILS:", !!recipientEmails);
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Parse comma-separated recipient emails
    const recipients = recipientEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

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

    // Format the email content - designed to look like a message, not a form
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f5f5f5;
              color: #333333;
              padding: 20px;
              margin: 0;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #0a1930 0%, #1a2347 100%);
              padding: 24px 30px;
              border-bottom: 3px solid #4fc3f7;
            }
            .header-content {
              display: flex;
              align-items: center;
            }
            .avatar {
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #028bee 0%, #4fc3f7 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 16px;
              font-size: 22px;
              color: white;
              font-weight: bold;
            }
            .sender-info h2 {
              color: #ffffff;
              margin: 0 0 4px 0;
              font-size: 18px;
              font-weight: 600;
            }
            .sender-info p {
              color: #4fc3f7;
              margin: 0;
              font-size: 14px;
            }
            .message-body {
              padding: 30px;
            }
            .message-text {
              font-size: 16px;
              color: #333333;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #4fc3f7;
              margin: 0;
              white-space: pre-wrap;
            }
            .meta-info {
              padding: 20px 30px;
              background: #f8f9fa;
              border-top: 1px solid #e9ecef;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .meta-row:last-child {
              margin-bottom: 0;
            }
            .meta-label {
              color: #6c757d;
            }
            .meta-value {
              color: #333333;
              font-weight: 500;
            }
            .meta-value a {
              color: #028bee;
              text-decoration: none;
            }
            .meta-value a:hover {
              text-decoration: underline;
            }
            .reply-btn {
              display: inline-block;
              background: linear-gradient(135deg, #028bee 0%, #4fc3f7 100%);
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 14px;
              margin-top: 16px;
            }
            .footer {
              padding: 16px 30px;
              background: #0a1930;
              text-align: center;
            }
            .footer p {
              color: rgba(255, 255, 255, 0.6);
              margin: 0;
              font-size: 12px;
            }
            .footer a {
              color: #4fc3f7;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-content">
                <div class="avatar">${name.charAt(0).toUpperCase()}</div>
                <div class="sender-info">
                  <h2>${name}</h2>
                  <p>sent you a message</p>
                </div>
              </div>
            </div>
            
            <div class="message-body">
              <p class="message-text">${message.replace(/\n/g, "<br>")}</p>
              
              <a href="mailto:${email}?subject=Re: Your message to Tokamak Support" class="reply-btn">
                Reply to ${name}
              </a>
            </div>
            
            <div class="meta-info">
              <div class="meta-row">
                <span class="meta-label">From:</span>
                <span class="meta-value"><a href="mailto:${email}">${email}</a></span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Received:</span>
                <span class="meta-value">${timestamp}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Via:</span>
                <span class="meta-value">Tokamak zk-EVM Support Chat</span>
              </div>
            </div>
            
            <div class="footer">
              <p>This message was received via the <a href="https://tokamak.network">Tokamak zk-EVM</a> website support chat.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
${name} sent you a message
${"=".repeat(name.length + 21)}

"${message}"

---
From: ${name} <${email}>
Received: ${timestamp}
Via: Tokamak zk-EVM Support Chat

Reply directly to this email to respond to ${name}.
    `.trim();

    // Send email to all recipients
    console.log("📧 [CONTACT] Sending email to:", recipients.join(", "));
    
    const result = await transporter.sendMail({
      from: `"${name} via Tokamak Support" <${smtpEmail}>`,
      to: recipients.join(", "),
      replyTo: email,
      subject: `${name} sent you a message`,
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

