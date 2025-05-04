export function genTemplateForOtp(otp: string): string {
  return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; background: #f9fafb; border-radius: 8px; padding: 30px; border: 1px solid #e5e7eb;">
        <h2 style="text-align: center; color: #1f2937; margin-bottom: 20px;">🔐 OTP Verification</h2>
        <p style="font-size: 16px; color: #4b5563;">
          Hi there,
        </p>
        <p style="font-size: 16px; color: #4b5563;">
          You recently requested to reset your password. Use the following one-time password (OTP) to proceed:
        </p>
        <div style="margin: 30px 0; text-align: center;">
          <span style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; font-size: 28px; border-radius: 6px; letter-spacing: 6px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
        </p>
        <p style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
          If you didn’t request this, you can safely ignore this email.
        </p>
        <p style="margin-top: 40px; font-size: 14px; color: #4b5563;">
          — The YourApp Team
        </p>
      </div>
    `;
}
