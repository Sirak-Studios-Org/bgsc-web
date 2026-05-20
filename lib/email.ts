import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "");
export const FROM = process.env.EMAIL_FROM ?? "stephie@badgirlstrength.club";

export async function sendWelcomeEmail(to: string, name: string, recommendedLesson: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to BGSC — Your Plan is Ready 🔥",
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>Your Bad Girl Strength Club membership is active.</p>
      <p>Based on your goals, we recommend starting with: <strong>${recommendedLesson}</strong></p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/learn">Start your first lesson →</a></p>
      <p>See you in the gym,<br/>Coach Stephie</p>
    `,
  });
}

export async function sendStreakRiskEmail(to: string, name: string, streak: number) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `🔥 Your ${streak}-day streak is at risk`,
    html: `
      <h1>Don't break the chain, ${name}!</h1>
      <p>Your <strong>${streak}-day streak</strong> is at risk — you haven't logged activity today.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">Log a workout to keep it alive →</a></p>
      <p>— Coach Stephie</p>
    `,
  });
}

export async function sendWeeklyRecapEmail(to: string, name: string, stats: { lessonsCompleted: number; streak: number; checkIns: number }) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your BGSC week in review 💪`,
    html: `
      <h1>Week recap, ${name}!</h1>
      <ul>
        <li>Lessons completed: <strong>${stats.lessonsCompleted}</strong></li>
        <li>Check-ins logged: <strong>${stats.checkIns}</strong></li>
        <li>Current streak: <strong>${stats.streak} days 🔥</strong></li>
      </ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">Keep the momentum →</a></p>
    `,
  });
}
