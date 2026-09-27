import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khôi phục phiên đăng nhập khi load lại trang. Trước đây chỉ tin vào
    // localStorage (không bao giờ hết hạn "trong mắt" frontend cho tới khi gọi
    // API và bị 401). Giờ dùng luôn access token đã lưu để hiển thị ngay (UX
    // mượt hơn), interceptor trong lib/api.js sẽ tự refresh nếu token đã hết hạn.
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      // Không có access token trong localStorage (ví dụ mở tab mới sau khi access
      // token cũ bị dọn) — thử refresh bằng cookie httpOnly trước khi bắt đăng nhập lại.
      authAPI
        .refresh()
        .then(({ data }) => {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        })
        .catch(() => {
          /* chưa từng đăng nhập hoặc refresh token đã hết hạn — giữ nguyên chưa đăng nhập */
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);

    return user;
  };

  const logout = () => {
    authAPI.logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isITStaff: user?.role === 'it_staff' || user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
