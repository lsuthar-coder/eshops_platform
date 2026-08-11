import { env } from "../config/env.js";

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendDomainAlertEmail({ to, storeName, domainName }) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resend.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Storeforge <updates@lsuthar.in>",
      to: [to],
      subject: `Action needed: ${domainName} isn't verified yet`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Hi,</p>
          <p>
            <strong>${domainName}</strong> for <strong>${storeName}</strong>
            still hasn't verified — it's been 7 days since you added it.
          </p>
          <p>
            Double-check the DNS record with your domain provider. If it's
            still not verified after 14 days total, we'll pause the domain
            and your store will keep running on its original storeforge URL.
          </p>
          <p>Log in to your admin portal to check the current status or re-check verification.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send domain alert email: ${response.status} ${text}`);
  }
}
