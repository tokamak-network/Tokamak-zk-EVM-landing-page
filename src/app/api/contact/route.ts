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

    // Format the email content - minimal and clean design
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
            <p class="message">${message.replace(/\n/g, "<br>")}</p>
            
            <p class="meta">
              <strong>${name}</strong> &lt;<a href="mailto:${email}">${email}</a>&gt;<br>
              ${timestamp}
            </p>
            
            <p class="footer">
              Received via Tokamak zk-EVM Support
            </p>
          </div>
        </body>
      </html>
    `;

    const textContent = `
${message}

—
${name} <${email}>
${timestamp}

Received via Tokamak zk-EVM Support
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

