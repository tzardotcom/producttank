import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ProductTank";

export async function sendConfirmationEmail(params: {
  to: string;
  personName: string;
  eventTitle: string;
  eventStartsAt: string;
}): Promise<{ id?: string; error?: Error }> {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY not set, skipping email");
    return { id: undefined };
  }
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Potwierdzenie zapisu – ${params.eventTitle}`,
    html: `
      <p>Cześć ${params.personName},</p>
      <p>Zapis na event <strong>${params.eventTitle}</strong> (${params.eventStartsAt}) został potwierdzony.</p>
      <p>Do zobaczenia!</p>
      <p>— ${APP_NAME}</p>
    `,
  });
  if (error) return { error };
  return { id: data?.id };
}

export async function sendReminderEmail(params: {
  to: string;
  personName: string;
  eventTitle: string;
  eventStartsAt: string;
}): Promise<{ id?: string; error?: Error }> {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY not set, skipping reminder");
    return { id: undefined };
  }
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Przypomnienie – jutro: ${params.eventTitle}`,
    html: `
      <p>Cześć ${params.personName},</p>
      <p>Przypominamy o jutrzejszym evencie <strong>${params.eventTitle}</strong> (${params.eventStartsAt}).</p>
      <p>Do zobaczenia!</p>
      <p>— ${APP_NAME}</p>
    `,
  });
  if (error) return { error };
  return { id: data?.id };
}

export async function sendFeedbackFollowUpEmail(params: {
  to: string;
  personName: string;
  eventTitle: string;
  feedbackUrl: string;
}): Promise<{ id?: string; error?: Error }> {
  if (!resend) {
    console.warn("[Resend] RESEND_API_KEY not set, skipping follow-up");
    return { id: undefined };
  }
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Jak było na "${params.eventTitle}"? – Twoja opinia`,
    html: `
      <p>Cześć ${params.personName},</p>
      <p>Dziękujemy za udział w <strong>${params.eventTitle}</strong>. Chcielibyśmy poznać Twoją opinię – zajmie to chwilę.</p>
      <p><a href="${params.feedbackUrl}">Wypełnij krótką ankietę →</a></p>
      <p>— ${APP_NAME}</p>
    `,
  });
  if (error) return { error };
  return { id: data?.id };
}
