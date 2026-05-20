export { resend, FROM, sendWelcomeEmail, sendStreakRiskEmail, sendWeeklyRecapEmail } from "@/lib/email";
import { resend, FROM } from "@/lib/email";
import { paymentFailedEmailHtml, cancellationConfirmedEmailHtml } from "./templates";

export async function sendPaymentFailedEmail(email: string, name: string, amount: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Action required: payment failed for your BGSC membership",
    html: paymentFailedEmailHtml(name, amount),
  });
}

export async function sendCancellationConfirmedEmail(email: string, name: string, expiresAt: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your BGSC membership has been cancelled",
    html: cancellationConfirmedEmailHtml(name, expiresAt),
  });
}
