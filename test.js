import { Resend } from 'resend';

const resend = new Resend('re_TEeZ4Jq4_2b3S7HcKyvLhUHoD8FNpg1Kf');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'davidgjermeni@gmail.com',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});
