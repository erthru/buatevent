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

const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Buat Event NoReply" <norepply@buatevent.com>`,
    to,
    subject,
    html,
  });
};

export const sendInvoice = async (
  name: string,
  email: string,
  eventTitle: string,
  ticketName: string,
  ticketPrice: number,
  invoiceLink: string
) => {
  const html = `
    <p>Terima kasih ${name} telah menggunakan platform Buat Event, berikut detail pembayaran untuk tiket anda:</p>
    <p>Acara: ${eventTitle}</p>
    <p>Jenis Tiket: ${ticketName}</p>
    <p>Harga: Rp ${ticketPrice.toLocaleString()}</p>
    <p>Silahkan klik link berikut untuk masuk ke menu pembayaran: <a href="${invoiceLink}">${invoiceLink}</a></p>
  `;

  await sendEmail(
    email,
    `Pembayaran untuk Ticket ${ticketName} dari ${eventTitle} | Buat Event`,
    html
  );
};

export const sendTicket = async (
  name: string,
  email: string,
  eventTitle: string,
  ticketName: string,
  validationCode: string
) => {
  const html = `
    <p>Terima kasih ${name} telah menggunakan platform Buat Event, berikut detail tiket anda:</p>
    <p>Acara: ${eventTitle}</p>
    <p>Jenis Tiket: ${ticketName}</p>
    <p>Kode Validasi: ${validationCode}</p>
  `;

  await sendEmail(
    email,
    `Detail Ticket ${ticketName} dari ${eventTitle} | Buat Event`,
    html
  );
};
