const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export interface PasswordChange {
  changedAt: Date;
  ip?: string;
  userAgent?: string;
}

export function passwordChangeDetails({ changedAt, ip, userAgent }: PasswordChange) {
  return {
    when: changedAt.toUTCString(),
    ip: ip?.trim() || 'Unknown',
    device: userAgent?.trim() || 'Unknown device',
  };
}

export function buildPasswordChangedEmailHtml(change: PasswordChange): string {
  const { when, ip, device } = passwordChangeDetails(change);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your password was changed</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 40px 16px;">
      <div style="max-width: 480px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Chakri AI</h1>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">Your password was changed</p>
        </div>

        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          The password for your Chakri AI account was just updated. Every other signed-in session has been logged out.
        </p>

        <div style="background: #1e293b; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #334155; font-size: 13px; line-height: 1.8;">
          <div><span style="color: #94a3b8;">When:</span> <span style="color: #f3f4f6;">${when}</span></div>
          <div><span style="color: #94a3b8;">IP address:</span> <span style="color: #f3f4f6;">${escape(ip)}</span></div>
          <div><span style="color: #94a3b8;">Device:</span> <span style="color: #f3f4f6;">${escape(device)}</span></div>
        </div>

        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
          If you didn't make this change, reset your password immediately and contact support@chakriai.com.
        </p>

        <hr style="border: 0; border-top: 1px solid #1f2937; margin: 24px 0 16px 0;" />

        <div style="text-align: center; color: #4b5563; font-size: 11px;">
          &copy; ${new Date().getFullYear()} Chakri AI. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
}
