const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://badgirlstrength.club";

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Bad Girl Strength Club</title>
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#F5F5F3;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="background:#8F0000;padding:20px 32px;">
              <span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:0.2em;text-transform:uppercase;">BGSC</span>
            </td>
          </tr>
          <tr>
            <td style="background:#111111;padding:32px;border:1px solid #1E1E1E;border-top:none;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;text-align:center;">
              <span style="font-size:11px;color:#666;letter-spacing:0.1em;">Bad Girl Strength Club · You were never meant to stay small.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:14px 28px;background:#e40000;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;text-decoration:none;">${label}</a>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type ApplicationNotification = {
  tier: string;
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  trainingHistory?: string | null;
  goals?: string | null;
  whyNow?: string | null;
  submittedAt?: Date;
};

export function applicationNotificationEmailHtml(app: ApplicationNotification): string {
  const row = (label: string, value?: string | null): string => {
    const safe = value && value.trim() ? escapeHtml(value.trim()) : "&mdash;";
    return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #1E1E1E;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#8A8A8A;width:150px;vertical-align:top;">${label}</td>
        <td style="padding:12px 0;border-bottom:1px solid #1E1E1E;font-size:14px;color:#F5F5F3;line-height:1.6;white-space:pre-wrap;">${safe}</td>
      </tr>`;
  };

  const submitted = app.submittedAt
    ? app.submittedAt.toLocaleString("en-US", { timeZone: "America/New_York" })
    : "";

  return base(`
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.25em;color:#8F0000;">New Intake Submission</p>
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#F5F5F3;letter-spacing:-0.02em;">${escapeHtml(app.name)}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#BFBFBF;line-height:1.7;">A new application came in through the Step-In form on the ${escapeHtml(app.tier)} tier.${submitted ? ` Submitted ${escapeHtml(submitted)} ET.` : ""}</p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 8px;">
      ${row("Tier", app.tier)}
      ${row("Name", app.name)}
      ${row("Email", app.email)}
      ${row("Phone", app.phone)}
      ${row("Location", app.location)}
      ${row("Training background", app.trainingHistory)}
      ${row("Goals", app.goals)}
      ${row("Why now", app.whyNow)}
    </table>
    <p style="margin:24px 0 0;font-size:13px;color:#BFBFBF;line-height:1.7;">Reply directly to this email to reach ${escapeHtml(app.name.split(" ")[0] || "the applicant")} at <a href="mailto:${escapeHtml(app.email)}" style="color:#e40000;text-decoration:none;">${escapeHtml(app.email)}</a>.</p>
  `);
}

export function welcomeEmailHtml(name: string): string {
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F5F3;letter-spacing:-0.02em;">Welcome, ${name} 🔥</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#BFBFBF;line-height:1.7;">Your Bad Girl Strength Club membership is active. You're officially part of a community of women who train hard, show up, and refuse to stay small.</p>
    <p style="margin:0 0 8px;font-size:14px;color:#BFBFBF;line-height:1.7;">Here's how to get started:</p>
    <ul style="margin:0 0 16px;padding-left:20px;color:#BFBFBF;font-size:14px;line-height:2;">
      <li>Complete your onboarding quiz for a personalised plan</li>
      <li>Start your first lesson — aim for today</li>
      <li>Introduce yourself in the community</li>
    </ul>
    ${btn(`${APP_URL}/portal`, "Start Training Now")}
    <p style="margin:32px 0 0;font-size:13px;color:#666;">See you in the gym,<br/><strong style="color:#BFBFBF;">Coach Stephie</strong></p>
  `);
}

export function streakRiskEmailHtml(name: string, streak: number): string {
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F5F3;letter-spacing:-0.02em;">Don't break the chain, ${name} 🔥</h1>
    <p style="margin:0 0 8px;font-size:15px;color:#BFBFBF;line-height:1.7;">Your <strong style="color:#F5F5F3;">${streak}-day streak</strong> is at risk — you haven't logged activity today.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#BFBFBF;line-height:1.7;">Even 10 minutes counts. A quick workout, a video lesson, or a check-in — all of it keeps the chain alive.</p>
    <div style="background:#1A0000;border:1px solid #8F0000;padding:16px;margin:0 0 16px;">
      <span style="font-size:32px;font-weight:900;color:#8F0000;letter-spacing:-0.02em;">🔥 ${streak}</span>
      <span style="font-size:13px;color:#BFBFBF;margin-left:8px;text-transform:uppercase;letter-spacing:0.1em;">Day Streak</span>
    </div>
    ${btn(`${APP_URL}/portal`, "Log Activity Now")}
    <p style="margin:32px 0 0;font-size:13px;color:#666;">— Coach Stephie</p>
  `);
}

export function weeklyRecapEmailHtml(name: string, lessonsThisWeek: number, streak: number): string {
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F5F3;letter-spacing:-0.02em;">Your week in review, ${name} 💪</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#BFBFBF;line-height:1.7;">Here's what you accomplished this week:</p>
    <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;">
      <tr>
        <td style="padding:16px;background:#161616;border:1px solid #1E1E1E;text-align:center;width:50%;">
          <div style="font-size:28px;font-weight:900;color:#F5F5F3;">${lessonsThisWeek}</div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#BFBFBF;margin-top:4px;">Lessons done</div>
        </td>
        <td style="width:8px;"></td>
        <td style="padding:16px;background:#161616;border:1px solid #1E1E1E;text-align:center;width:50%;">
          <div style="font-size:28px;font-weight:900;color:${streak > 0 ? "#8F0000" : "#F5F5F3"};">🔥 ${streak}</div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#BFBFBF;margin-top:4px;">Day streak</div>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 16px;font-size:14px;color:#BFBFBF;line-height:1.7;">${lessonsThisWeek > 0 ? "Great work this week. Consistency is the whole game." : "This week was quiet — but next week is yours."}</p>
    ${btn(`${APP_URL}/portal`, "Keep the momentum →")}
    <p style="margin:32px 0 0;font-size:13px;color:#666;">— Coach Stephie</p>
  `);
}

export function paymentFailedEmailHtml(name: string, amount: string): string {
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F5F3;letter-spacing:-0.02em;">Payment issue, ${name}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#BFBFBF;line-height:1.7;">We couldn't process your membership payment of <strong style="color:#F5F5F3;">${amount}</strong>.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#BFBFBF;line-height:1.7;">Your access is still active while we retry — but update your payment method now to avoid any interruption to your training.</p>
    <div style="background:#1A0000;border:1px solid #8F0000;padding:14px 16px;margin:0 0 24px;font-size:13px;color:#BFBFBF;">
      ⚠️ &nbsp;We'll retry payment automatically over the next few days.
    </div>
    ${btn(`${APP_URL}/portal/profile`, "Update Payment Method")}
    <p style="margin:32px 0 0;font-size:13px;color:#666;">If you need help, reply to this email and we'll sort it out.<br/><strong style="color:#BFBFBF;">Coach Stephie</strong></p>
  `);
}

export function cancellationConfirmedEmailHtml(name: string, expiresAt: string): string {
  return base(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#F5F5F3;letter-spacing:-0.02em;">Membership cancelled, ${name}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#BFBFBF;line-height:1.7;">We're sad to see you go. Your membership has been cancelled and you'll have full access until <strong style="color:#F5F5F3;">${expiresAt}</strong>.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#BFBFBF;line-height:1.7;">Everything you've built — your streak history, badge collection, and journal entries — will be here if you come back.</p>
    <div style="background:#161616;border:1px solid #1E1E1E;padding:16px;margin:0 0 24px;">
      <p style="margin:0;font-size:13px;color:#BFBFBF;font-style:italic;">"Every great athlete was once a beginner who decided to try one more time."</p>
      <p style="margin:8px 0 0;font-size:12px;color:#666;">— Coach Stephie</p>
    </div>
    ${btn(`${APP_URL}/portal/register`, "Resubscribe any time →")}
    <p style="margin:32px 0 0;font-size:13px;color:#666;">Thank you for being part of BGSC.<br/><strong style="color:#BFBFBF;">Coach Stephie</strong></p>
  `);
}
