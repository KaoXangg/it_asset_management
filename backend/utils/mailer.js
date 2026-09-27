const nodemailer = require('nodemailer');

// Chỉ khởi tạo transporter khi đã cấu hình SMTP_HOST trong .env — nếu chưa cấu hình,
// mọi lời gọi sendMail() sẽ resolve là "đã bỏ qua" thay vì crash cả server.
function getTransporter() {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

/**
 * Gửi email. Trả về { sent: boolean, reason?: string } thay vì throw, để job nền
 * (cron) không bị crash chỉ vì chưa cấu hình SMTP hoặc gửi lỗi.
 */
async function sendMail({ to, subject, html, text }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[mailer] SMTP_HOST chưa được cấu hình trong .env — bỏ qua gửi email:', subject);
    return { sent: false, reason: 'SMTP chưa được cấu hình' };
  }
  if (!to) {
    console.warn('[mailer] Không có người nhận (NOTIFY_EMAILS trống) — bỏ qua gửi email:', subject);
    return { sent: false, reason: 'Không có người nhận' };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (error) {
    console.error('[mailer] Gửi email thất bại:', error.message);
    return { sent: false, reason: error.message };
  }
}

module.exports = { sendMail };
