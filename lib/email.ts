import nodemailer from 'nodemailer';
import path from 'path';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const logoPath = path.join(process.cwd(), 'src/assets/images/icon_stepzen.png');

export async function sendOtpEmail(to: string, code: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border: 2px solid #000000; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="cid:stepzen-logo" alt="StepZen Logo" style="width: 64px; height: 64px; margin-bottom: 12px;" />
        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #000;">StepZen</h1>
        <p style="color: #6b7280; margin-top: 4px; font-size: 14px;">Email Verification</p>
      </div>

      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Hi there! Use the code below to verify your email address and complete your registration:
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background: #f3f4f6; border: 2px solid #000; border-radius: 12px; padding: 16px 32px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #000;">
          ${code}
        </div>
      </div>

      <p style="font-size: 13px; color: #9ca3af; text-align: center;">
        This code expires in <strong>5 minutes</strong>. If you didn't request this, please ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #d1d5db; text-align: center;">
        &copy; ${new Date().getFullYear()} StepZen — Internships for Developers
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"StepZen" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your StepZen Verification Code',
    html,
    attachments: [
      {
        filename: 'icon_stepzen.png',
        path: logoPath,
        cid: 'stepzen-logo',
      },
    ],
  });
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border: 2px solid #000000; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="cid:stepzen-logo" alt="StepZen Logo" style="width: 64px; height: 64px; margin-bottom: 12px;" />
        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #000;">StepZen</h1>
        <p style="color: #6b7280; margin-top: 4px; font-size: 14px;">Password Reset</p>
      </div>

      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        We received a request to reset your password. Use the code below to set a new password:
      </p>

      <div style="text-align: center; margin: 28px 0;">
        <div style="display: inline-block; background: #fef3c7; border: 2px solid #000; border-radius: 12px; padding: 16px 32px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #000;">
          ${code}
        </div>
      </div>

      <p style="font-size: 13px; color: #9ca3af; text-align: center;">
        This code expires in <strong>5 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #d1d5db; text-align: center;">
        &copy; ${new Date().getFullYear()} StepZen — Internships for Developers
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"StepZen" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Reset Your StepZen Password',
    html,
    attachments: [
      {
        filename: 'icon_stepzen.png',
        path: logoPath,
        cid: 'stepzen-logo',
      },
    ],
  });
}

export async function sendContactNotificationEmail(name: string, senderEmail: string, message: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border: 2px solid #000000; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="cid:stepzen-logo" alt="StepZen Logo" style="width: 64px; height: 64px; margin-bottom: 12px;" />
        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #000;">StepZen</h1>
        <p style="color: #6b7280; margin-top: 4px; font-size: 14px;">New Contact Message</p>
      </div>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;"><strong>From:</strong></p>
        <p style="font-size: 16px; color: #111827; margin: 0 0 16px 0;">${name} &lt;${senderEmail}&gt;</p>

        <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;"><strong>Message:</strong></p>
        <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>

      <p style="font-size: 13px; color: #9ca3af; text-align: center;">
        You can reply directly to <strong>${senderEmail}</strong>
      </p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #d1d5db; text-align: center;">
        &copy; ${new Date().getFullYear()} StepZen — Internships for Developers
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"StepZen" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER!,
    replyTo: senderEmail,
    subject: `New Contact Message from ${name}`,
    html,
    attachments: [
      {
        filename: 'icon_stepzen.png',
        path: logoPath,
        cid: 'stepzen-logo',
      },
    ],
  });
}

export async function sendContactReplyEmail(
  to: string,
  recipientName: string,
  originalMessage: string,
  replyMessage: string
) {
  // Escape HTML to prevent injection / template breakage
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #ffffff; border: 2px solid #000000; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="cid:stepzen-logo" alt="StepZen Logo" style="width: 64px; height: 64px; margin-bottom: 12px;" />
        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #000;">StepZen</h1>
        <p style="color: #6b7280; margin-top: 4px; font-size: 14px;">Reply to Your Message</p>
      </div>

      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Hi <strong>${esc(recipientName)}</strong>, thanks for reaching out! Here is our response:
      </p>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="font-size: 15px; color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${esc(replyMessage)}</p>
      </div>

      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 20px;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0; font-weight: 600;">YOUR ORIGINAL MESSAGE:</p>
        <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin: 0; white-space: pre-wrap;">${esc(originalMessage)}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #d1d5db; text-align: center;">
        &copy; ${new Date().getFullYear()} StepZen — Internships for Developers
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"StepZen" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'StepZen — Reply to Your Message',
    html,
    attachments: [
      {
        filename: 'icon_stepzen.png',
        path: logoPath,
        cid: 'stepzen-logo',
      },
    ],
  });
}
