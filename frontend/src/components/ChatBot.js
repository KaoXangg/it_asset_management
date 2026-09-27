import { useState, useRef, useEffect } from 'react';
import { HiChatBubbleLeftRight, HiXMark, HiPaperAirplane, HiSparkles } from 'react-icons/hi2';
import { RiRobot2Fill } from 'react-icons/ri';
import { chatAPI } from '../lib/api';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: 'Xin chào! Tôi là trợ lý ảo của hệ thống quản lý tài sản IT.\n\nTôi có thể giúp bạn:\n• Tìm kiếm tài sản\n• Hướng dẫn sử dụng hệ thống\n• Trả lời câu hỏi về quy trình\n• Báo cáo sự cố',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    const userMsg = {
      text: userMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Lịch sử hội thoại được gửi lên BACKEND (không lộ API key / system prompt ra client)
      const conversationHistory = messages
        .filter(msg => !msg.isTyping)
        .map(msg => ({
          role: msg.isBot ? 'bot' : 'user',
          content: msg.text
        }));

      const { data } = await chatAPI.sendMessage(userMessage, conversationHistory);

      setIsTyping(false);

      const botResponse = data.reply || 'Xin lỗi, tôi không hiểu. Bạn có thể hỏi lại được không? 😊';

      // Typing effect
      const fullText = botResponse;
      let currentText = '';

      for (let i = 0; i < fullText.length; i++) {
        setTimeout(() => {
          currentText += fullText[i];
          const isLastChar = i === fullText.length - 1;

          setMessages(prev => {
            const withoutTyping = prev.filter(msg => !msg.isTyping);
            return [...withoutTyping, {
              text: currentText,
              isBot: true,
              timestamp: new Date(),
              isTyping: !isLastChar
            }];
          });
        }, i * 30);
      }

    } catch (error) {
      console.error('API Error:', error);
      setIsTyping(false);
      const serverMessage = error.response?.data?.error;
      const errorMsg = {
        text: serverMessage || 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau! 😊',
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const quickReplies = ['Tìm tài sản', 'Phân bổ tài sản', 'Tạo bảo trì', 'Xuất báo cáo', 'Hướng dẫn'];

  return (
    <>
      {/* Chat Button */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        <div style={{ position: 'relative' }}>
          {!isOpen && (
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', display: 'flex', height: '12px', width: '12px' }}>
              <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', background: '#3b82f6', opacity: 0.75, animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
              <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '12px', width: '12px', background: '#3b82f6' }}></span>
            </span>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              height: '56px',
              width: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s',
              fontSize: '24px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isOpen ? <HiXMark /> : <HiChatBubbleLeftRight />}
          </button>
        </div>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          zIndex: 999,
          width: '384px',
          maxWidth: 'calc(100vw - 48px)',
          height: '550px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(59, 130, 246, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  height: '48px',
                  width: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px'
                }}>
                  <RiRobot2Fill />
                </div>
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  height: '14px',
                  width: '14px',
                  background: '#10b981',
                  border: '2px solid white',
                  borderRadius: '50%'
                }}></span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  IT Asset Assistant
                  <HiSparkles style={{ fontSize: '18px' }} />
                </h3>
                <p style={{ fontSize: '12px', opacity: 0.9, margin: 0 }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', marginRight: '4px', animation: 'pulse 2s infinite' }}></span>
                  Trả lời ngay lập tức
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            background: 'linear-gradient(to bottom, rgba(243, 244, 246, 0.3), white)'
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.isBot ? 'flex-start' : 'flex-end',
                  marginBottom: '16px'
                }}
              >
                <div style={{ maxWidth: '85%' }}>
                  <div style={{
                    borderRadius: '16px',
                    padding: '12px 16px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: msg.isBot ? 'white' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: msg.isBot ? '#1f2937' : 'white',
                    border: msg.isBot ? '1px solid #e5e7eb' : 'none'
                  }}>
                    <p style={{ fontSize: '14px', whiteSpace: 'pre-line', lineHeight: '1.6', margin: 0 }}>
                      {msg.text}
                    </p>
                  </div>
                  <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', paddingLeft: '8px' }}>
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></span>
                    <span style={{ width: '8px', height: '8px', background: '#9ca3af', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length === 1 && (
            <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(reply);
                    setTimeout(() => handleSend(), 0);
                  }}
                  style={{
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    padding: '6px 12px',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '16px',
                    background: 'white',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: 'white', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  opacity: input.trim() && !isTyping ? 1 : 0.5,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}
              >
                <HiPaperAirplane />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
