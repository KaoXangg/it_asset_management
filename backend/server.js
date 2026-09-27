const createApp = require('./app');

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Lịch nhắc nhở hằng ngày (bảo hành sắp hết hạn, quá hạn bảo trì) — xem backend/jobs/notifyJob.js
// Cần cấu hình SMTP_HOST + NOTIFY_EMAILS trong .env, nếu không job sẽ chỉ log cảnh báo và bỏ qua.
require('./jobs/notifyJob').scheduleNotifications();
