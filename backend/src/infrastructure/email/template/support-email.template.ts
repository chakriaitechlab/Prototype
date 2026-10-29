const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface SupportInquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export function buildSupportInquiryEmailHtml(inquiry: SupportInquiry): string {
  const name = escape(inquiry.name);
  const email = escape(inquiry.email);
  const subject = escape(inquiry.subject);
  const message = escape(inquiry.message);
  const replyHref = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent(`Re: ${inquiry.subject}`)}`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New support inquiry</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 40px 16px;">
      <div style="max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Chakri AI</h1>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">New support inquiry</p>
        </div>

        <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #334155;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">From</p>
          <p style="color: #f3f4f6; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">${name} &lt;<a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a>&gt;</p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Subject</p>
          <p style="color: #f3f4f6; font-size: 14px; margin: 0 0 12px 0; font-weight: 600;">${subject}</p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Submitted at</p>
          <p style="color: #cbd5e1; font-size: 13px; margin: 0;">${inquiry.submittedAt}</p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Message</p>
        <div style="background: #0f172a; border-radius: 10px; padding: 16px; margin-bottom: 24px; border: 1px solid #334155; color: #cbd5e1; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>

        <div style="text-align: center;">
          <a href="${replyHref}" style="display: inline-block; padding: 12px 24px; border-radius: 8px; background: #6366f1; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600;">Reply to ${name} &rarr;</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #1f2937; margin: 24px 0 16px 0;" />

        <div style="text-align: center; color: #4b5563; font-size: 11px;">
          Chakri AI &middot; Internal support notification
        </div>
      </div>
    </body>
    </html>
  `;
}

export function buildSupportAutoReplyEmailHtml(name: string, subject: string): string {
  const safeName = escape(name);
  const safeSubject = escape(subject);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We've received your message</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 40px 16px;">
      <div style="max-width: 480px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Chakri AI</h1>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">We've received your request</p>
        </div>

        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Hi <strong>${safeName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for contacting us! We've received your inquiry regarding <em>"${safeSubject}"</em> and our support team has been notified.
        </p>

        <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #334155;">
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0;">
            &bull; <strong>Response time:</strong> within 1 business day (Saturday&ndash;Thursday, 9am&ndash;6pm GMT+6).<br/>
            &bull; <strong>Need to add info?</strong> Simply reply to this email.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 4px 0;">Warm regards,</p>
        <p style="color: #f3f4f6; font-size: 14px; font-weight: 600; margin: 0;">The Chakri AI Support Team</p>

        <hr style="border: 0; border-top: 1px solid #1f2937; margin: 24px 0 16px 0;" />

        <div style="text-align: center; color: #4b5563; font-size: 11px;">
          &copy; ${new Date().getFullYear()} Chakri AI. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}
