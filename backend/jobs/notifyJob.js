const cron = require('node-cron');
const db = require('../config/database');
const { sendMail } = require('../utils/mailer');

/**
 * Kiểm tra tài sản sắp hết bảo hành (trong 7 ngày) và tài sản quá hạn bảo trì
 * (không bảo trì > 180 ngày), gửi email tổng hợp tới NOTIFY_EMAILS (phân tách bằng dấu phẩy).
 * Trả về dữ liệu đã kiểm tra để endpoint "gửi thử" có thể hiển thị kết quả ngay cả khi
 * chưa cấu hình SMTP.
 */
async function checkAndNotify() {
  const [expiringWarranty] = await db.query(`
    SELECT asset_code, name, warranty_expiry
    FROM assets
    WHERE warranty_expiry BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
  `);

  const [dueMaintenance] = await db.query(`
    SELECT a.asset_code, a.name, MAX(mr.maintenance_date) as last_maintenance_date
    FROM assets a
    LEFT JOIN maintenance_records mr ON a.id = mr.asset_id AND mr.status = 'completed'
    WHERE a.status NOT IN ('broken', 'disposed')
    GROUP BY a.id, a.asset_code, a.name
    HAVING MAX(mr.maintenance_date) IS NULL OR DATEDIFF(DAY, MAX(mr.maintenance_date), GETDATE()) > 180
  `);

  const hasItems = expiringWarranty.length > 0 || dueMaintenance.length > 0;
  let mailResult = { sent: false, reason: 'Không có gì cần nhắc' };

  if (hasItems) {
    const rows = (label, items, cols) =>
      items.length === 0
        ? ''
        : `<h3>${label}</h3><ul>${items.map((i) => `<li>${cols(i)}</li>`).join('')}</ul>`;

    const html = `
      <h2>Nhắc nhở tài sản IT — ${new Date().toLocaleDateString('vi-VN')}</h2>
      ${rows('Sắp hết bảo hành (trong 7 ngày)', expiringWarranty, (a) => `${a.asset_code} — ${a.name} (hết hạn ${new Date(a.warranty_expiry).toLocaleDateString('vi-VN')})`)}
      ${rows('Quá hạn bảo trì (> 6 tháng)', dueMaintenance, (a) => `${a.asset_code} — ${a.name}`)}
    `;

    mailResult = await sendMail({
      to: process.env.NOTIFY_EMAILS,
      subject: `[IT Asset] Nhắc nhở: ${expiringWarranty.length} sắp hết bảo hành, ${dueMaintenance.length} quá hạn bảo trì`,
      html,
    });
  }

  return { expiringWarranty, dueMaintenance, mailResult };
}

// Chạy mỗi ngày lúc 8:00 sáng. Chỉ đăng ký job khi không phải môi trường test,
// để chạy `npm test` không tự bật lịch nền.
function scheduleNotifications() {
  if (process.env.NODE_ENV === 'test') return;
  cron.schedule('0 8 * * *', () => {
    checkAndNotify().catch((err) => console.error('[notifyJob] Lỗi khi chạy job nhắc nhở:', err));
  });
}

module.exports = { checkAndNotify, scheduleNotifications };
