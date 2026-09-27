const SYSTEM_PROMPT = `Bạn là chatbot AI của hệ thống quản lý tài sản IT. Bạn nói chuyện thân thiện, chuyên nghiệp và hỗ trợ người dùng.

THÔNG TIN HỆ THỐNG:
- Hệ thống quản lý tài sản IT (IT Asset Management System)
- Chức năng chính:
  + Quản lý tài sản: Thêm, sửa, xóa, tìm kiếm tài sản (laptop, desktop, monitor, printer, phone, tablet)
  + Quản lý phân bổ: Phân bổ tài sản cho nhân viên, theo dõi trạng thái
  + Quản lý bảo trì: Lên lịch bảo trì, ghi nhận chi phí, theo dõi lịch sử
  + Báo cáo & thống kê: Dashboard với biểu đồ, xuất Excel, activity logs
  + Quản lý người dùng: 3 vai trò (Admin, IT Staff, Regular User)

- Vai trò người dùng:
  + Admin: Toàn quyền quản lý hệ thống, người dùng, tài sản
  + IT Staff: Quản lý tài sản, phân bổ, bảo trì, xem báo cáo
  + Regular User: Xem tài sản được phân bổ, lịch sử sử dụng

- Quy trình:
  + Thêm tài sản mới: Vào "Tài sản" → "Thêm tài sản" → Điền thông tin → Lưu (tự động tạo QR code)
  + Phân bổ tài sản: Vào "Phân bổ" → "Thêm phân bổ" → Chọn tài sản & người dùng → Lưu
  + Trả tài sản: Vào "Phân bổ" → Tìm phân bổ → "Trả tài sản"
  + Tạo bảo trì: Vào "Bảo trì" → "Thêm bảo trì" → Điền thông tin → Lưu
  + Xuất báo cáo: Vào "Báo cáo" → "Xuất Excel Tài sản"

PHONG CÁCH TRẢ LỜI:
- Nói chuyện thân thiện, chuyên nghiệp
- Trả lời ngắn gọn, súc tích, dễ hiểu
- Hướng dẫn từng bước cụ thể
- Dùng emoji vừa phải: 💻, 📱, ✅, 📊, 🔧, ⚙️
- Luôn sẵn sàng hỗ trợ và giải đáp`;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.1-8b-instant đã bị Groq khai tử (decommissioned) ngày 16/08/2026.
// Model thay thế được Groq khuyến nghị: openai/gpt-oss-20b (tốc độ tương đương, chất lượng tốt hơn).
const GROQ_MODEL = 'openai/gpt-oss-20b';

exports.sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY chưa được cấu hình trong backend/.env');
      return res.status(500).json({ error: 'Chatbot chưa được cấu hình API key. Vui lòng liên hệ quản trị viên.' });
    }

    // Giới hạn lịch sử hội thoại gửi lên (10 tin gần nhất, mỗi tin tối đa 2000 ký tự)
    // để tránh payload quá lớn / lạm dụng.
    const conversationHistory = Array.isArray(history)
      ? history.slice(-10).map(m => ({
          role: m.role === 'bot' ? 'assistant' : 'user',
          content: String(m.content || '').slice(0, 2000)
        }))
      : [];

    const groqResponse = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: message.slice(0, 2000) }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!groqResponse.ok) {
      const errBody = await groqResponse.text().catch(() => '');
      console.error('Groq API error:', groqResponse.status, errBody);

      if (groqResponse.status === 401) {
        return res.status(500).json({ error: 'API key AI không hợp lệ. Vui lòng kiểm tra lại GROQ_API_KEY.' });
      }
      if (groqResponse.status === 429) {
        return res.status(429).json({ error: 'Dịch vụ AI đang quá tải, vui lòng thử lại sau ít phút.' });
      }
      if (errBody.includes('model_decommissioned') || errBody.includes('does not exist')) {
        return res.status(500).json({ error: 'Model AI đang dùng đã ngừng hoạt động. Vui lòng cập nhật GROQ_MODEL trong chatController.js.' });
      }
      return res.status(502).json({ error: 'Dịch vụ AI tạm thời không phản hồi, vui lòng thử lại sau.' });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content
      || 'Xin lỗi, tôi không hiểu. Bạn có thể hỏi lại được không? 😊';

    res.json({ reply });
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
