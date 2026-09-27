import { useEffect, useState } from 'react';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';

const STORAGE_KEY = 'theme';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  // Đọc theme đã lưu (hoặc theo prefers-color-scheme) khi component mount ở client
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      aria-label="Đổi giao diện sáng/tối"
    >
      {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
    </button>
  );
}
