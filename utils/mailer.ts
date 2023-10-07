import { createTransport } from "nodemailer";

const { mailerUser, mailerPassword } = useRuntimeConfig();

const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: mailerUser,
    pass: mailerPassword,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Buat Event NoReply" <norepply@buatevent.com>`,
    to,
    subject,
    html,
  });
};
