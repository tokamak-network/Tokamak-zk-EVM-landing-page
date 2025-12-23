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

    // Format the email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'IBM Plex Mono', monospace, Arial, sans-serif;
              background-color: #0a1930;
              color: #ffffff;
              padding: 20px;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: linear-gradient(180deg, #0a1930 0%, #1a2347 100%);
              border: 2px solid #4fc3f7;
              border-radius: 12px;
              padding: 30px;
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 1px solid rgba(79, 195, 247, 0.3);
              margin-bottom: 20px;
            }
            .header h1 {
              color: #4fc3f7;
              margin: 0;
              font-size: 24px;
            }
            .field {
              margin-bottom: 20px;
            }
            .label {
              color: #4fc3f7;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
            }
            .value {
              color: #ffffff;
              font-size: 16px;
              padding: 10px;
              background: rgba(79, 195, 247, 0.1);
              border: 1px solid rgba(79, 195, 247, 0.3);
              border-radius: 8px;
            }
            .message-value {
              white-space: pre-wrap;
              line-height: 1.6;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid rgba(79, 195, 247, 0.3);
              margin-top: 20px;
              color: rgba(255, 255, 255, 0.6);
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}" style="color: #4fc3f7;">${email}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Message</div>
              <div class="value message-value">${message.replace(/\n/g, "<br>")}</div>
            </div>
            
            <div class="footer">
              Sent from Tokamak zk-EVM Landing Page Contact Form
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
New Contact Form Submission
===========================

Name: ${name}
Email: ${email}

Message:
${message}

---
Sent from Tokamak zk-EVM Landing Page Contact Form
    `.trim();

    // Send email to all recipients
    console.log("📧 [CONTACT] Sending email to:", recipients.join(", "));
    
    const result = await transporter.sendMail({
      from: `"Tokamak Contact Form" <${smtpEmail}>`,
      to: recipients.join(", "),
      replyTo: email,
      subject: `[Tokamak Contact] New message from ${name}`,
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

