import { Resend } from "resend";

export interface AuditEmailPayload {
  to: string;
  monthlySavings: number;
  annualSavings: number;
  reportUrl: string;
  company?: string;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "CostIQ <noreply@mailbotpay.click>";

let cachedClient: Resend | null = null;

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!cachedClient) cachedClient = new Resend(apiKey);
  return cachedClient;
}

function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );
}

function buildHtml({ annualSavings, reportUrl }: AuditEmailPayload): string {
  const safeUrl = escapeHtml(reportUrl);
  const savingsLine =
    annualSavings > 0
      ? `We found roughly <strong style="color:#0D2137;">${fmt(annualSavings)}/yr</strong> in potential savings across your stack.`
      : `Your full breakdown is ready inside the report.`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Your CostIQ audit is ready</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0D2137;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 24px 40px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
            <tr>
              <td style="padding-bottom:32px;">
                <span style="font-size:15px;font-weight:600;color:#0D2137;letter-spacing:-0.01em;">CostIQ</span>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:14px;">
                <h1 style="margin:0;font-size:20px;font-weight:600;line-height:1.4;letter-spacing:-0.01em;color:#0D2137;">Your audit is ready</h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:28px;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">${savingsLine}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:28px;">
                <a href="${safeUrl}" style="display:inline-block;background:#0D2137;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:11px 20px;border-radius:8px;">View report</a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:8px;">
                <p style="margin:0;font-size:13px;line-height:1.55;color:#94A3B8;">Or open this link in your browser:</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:40px;">
                <a href="${safeUrl}" style="font-size:13px;line-height:1.55;color:#5B7A99;word-break:break-all;text-decoration:underline;">${safeUrl}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #eef2f7;padding-top:20px;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#94A3B8;">You're receiving this because you requested your audit report on CostIQ.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText({ annualSavings, reportUrl }: AuditEmailPayload): string {
  const savingsLine =
    annualSavings > 0
      ? `We found roughly ${fmt(annualSavings)}/yr in potential savings across your stack.`
      : `Your full breakdown is ready inside the report.`;
  return [
    "Your CostIQ audit is ready.",
    "",
    savingsLine,
    "",
    `View report: ${reportUrl}`,
  ].join("\n");
}

export async function sendAuditEmail(payload: AuditEmailPayload): Promise<{ id: string }> {
  const client = getClient();
  const { data, error } = await client.emails.send({
    from: FROM_EMAIL,
    to: payload.to,
    subject: "Your CostIQ audit is ready",
    html: buildHtml(payload),
    text: buildText(payload),
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
  return { id: data?.id ?? "" };
}
