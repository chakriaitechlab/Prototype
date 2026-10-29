export function buildResetPasswordEmailHtml(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 40px 16px;">
      <div style="max-width: 480px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Chakri AI</h1>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">Password reset request</p>
        </div>

        <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px solid #334155;">
          <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px 0;">Use this code to reset your password:</p>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; padding: 12px; background: #0f172a; border-radius: 8px; display: inline-block;">
            ${code}
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">This code will expire in <strong>5 minutes</strong>.</p>
        </div>

        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 0 0 16px 0;">
          If you did not request a password reset, you can safely ignore this email. Your password will not change.
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
