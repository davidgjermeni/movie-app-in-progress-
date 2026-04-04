import { Resend } from 'resend';
import { EmailTemplate } from 'app/components/email-template';
const resend = new Resend(process.env.RESEND_API_KEY);

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'davidgjermeni@gmail.com',
  subject: 'Hello World',
  react: EmailTemplate({verificationCode}),
});
