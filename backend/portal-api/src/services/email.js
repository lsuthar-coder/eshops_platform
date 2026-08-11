import { env } from "../config/env.js";

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendOtpEmail({ to, otp }) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resend.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Storeforge <updates@lsuthar.in>",
      to: [to],
      subject: "Your verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Your verification code is:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
          <p style="color: #666;">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send OTP email: ${response.status} ${text}`);
  }
}
