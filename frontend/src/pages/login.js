import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineComputerDesktop,
  HiOutlineShieldCheck,
  HiOutlineBolt,
} from 'react-icons/hi2';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const highlights = [
    { icon: <HiOutlineComputerDesktop />, text: 'Quản lý tài sản tập trung' },
    { icon: <HiOutlineShieldCheck />, text: 'Bảo mật & phân quyền' },
    { icon: <HiOutlineBolt />, text: 'Trợ lý ảo tức thì' },
  ];

  const iconStyle = {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#8b8fa8',
    fontSize: 19,
    pointerEvents: 'none',
    zIndex: 2,
  };

  return (
    <div className="login-page">
      <div className="login-grid" />
      <div className="login-glow login-glow-1" />
      <div className="login-glow login-glow-2" />

      <div className="login-card">
      
        <h1 className="login-title">IT Asset Management</h1>
        <p className="login-subtitle">Đăng nhập để quản lý tài sản của bạn</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Tên đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineUser style={iconStyle} />
              <input
                type="text"
                className="login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed style={iconStyle} />
              <input
                type="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            <span className="login-submit-shine" />
            {loading ? (
              <>
                <span className="login-spinner" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="login-divider">
          <span>Tài khoản dùng thử</span>
        </div>

        <div className="login-demo">
          <span>admin</span>
          <span className="login-demo-sep">/</span>
          <span>admin123</span>
        </div>

        <ul className="login-highlights">
          {highlights.map((h, i) => (
            <li key={i} style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
              <span className="login-highlight-icon">{h.icon}</span>
              {h.text}
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at top, #1a1d3a 0%, #0a0b1a 60%);
          padding: 24px;
        }

        .login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          -webkit-mask-image: radial-gradient(ellipse 60% 55% at 50% 40%, #000 20%, transparent 75%);
          mask-image: radial-gradient(ellipse 60% 55% at 50% 40%, #000 20%, transparent 75%);
          animation: gridDrift 30s linear infinite;
        }

        @keyframes gridDrift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 44px 44px, 44px 44px; }
        }

        .login-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(110px);
          opacity: 0.35;
          animation: drift 10s ease-in-out infinite;
        }
        .login-glow-1 {
          width: 460px;
          height: 460px;
          background: #6366f1;
          top: -160px;
          left: 50%;
          margin-left: -420px;
        }
        .login-glow-2 {
          width: 380px;
          height: 380px;
          background: #a855f7;
          bottom: -160px;
          right: 50%;
          margin-right: -420px;
          animation-delay: 3s;
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(24px, -16px) scale(1.08); }
        }

        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: rgba(22, 24, 46, 0.65);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 22px;
          padding: 40px 34px 32px;
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          animation: cardIn 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .login-logo {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          box-shadow: 0 10px 28px rgba(99, 102, 241, 0.45);
          animation: fadeInUp 0.5s ease-out 0.1s backwards;
        }
        .login-logo-icon {
          font-size: 26px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        .login-title {
          text-align: center;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
          margin-bottom: 6px;
          animation: fadeInUp 0.5s ease-out 0.15s backwards;
        }
        .login-subtitle {
          text-align: center;
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 28px;
          animation: fadeInUp 0.5s ease-out 0.2s backwards;
        }

        .login-form {
          animation: fadeInUp 0.5s ease-out 0.25s backwards;
        }

        .login-field {
          margin-bottom: 16px;
        }
        .login-field label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.55);
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .login-input {
          width: 100%;
          padding: 12px 14px 12px 44px;
          border-radius: 12px;
          border: 1.5px solid rgba(255, 255, 255, 0.09);
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          font-size: 14.5px;
          font-family: inherit;
          transition: all 0.2s ease;
        }
        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        .login-input:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
        }
        .login-input:focus {
          outline: none;
          border-color: #818cf8;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
        }

        .login-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          font-size: 13px;
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          animation: fadeIn 0.2s ease-out;
        }

        .login-submit {
          position: relative;
          overflow: hidden;
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
          box-shadow: 0 10px 26px rgba(99, 102, 241, 0.35);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(99, 102, 241, 0.5);
        }
        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-submit-shine {
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          transform: skewX(-20deg);
          animation: shine 3.2s ease-in-out infinite;
        }
        @keyframes shine {
          0% { left: -60%; }
          40%, 100% { left: 130%; }
        }

        .login-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0 14px;
          color: rgba(255, 255, 255, 0.3);
          font-size: 11.5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.09);
        }
        .login-divider span {
          padding: 0 12px;
        }

        .login-demo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-family: 'SFMono-Regular', Consolas, monospace;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 9px;
          margin-bottom: 26px;
        }
        .login-demo-sep {
          color: rgba(255, 255, 255, 0.25);
        }

        .login-highlights {
          list-style: none;
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }
        .login-highlights li {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-align: center;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.45);
          opacity: 0;
          animation: fadeInUp 0.4s ease-out forwards;
        }
        .login-highlight-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #a5b4fc;
        }

        @media (max-width: 460px) {
          .login-card {
            padding: 32px 22px 26px;
          }
        }
      `}</style>
    </div>
  );
}