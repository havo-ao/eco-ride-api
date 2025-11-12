import { transporter } from './email.config';

export async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: `"EcoRide" <ecoride923@gmail.com>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
}