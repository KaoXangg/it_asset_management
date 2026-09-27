import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ChatBot from './ChatBot';
import ThemeToggle from './ThemeToggle';
import { roleLabel } from '../lib/labels';
import {
  HiOutlineSquares2X2,
  HiOutlineComputerDesktop,
  HiOutlineArrowsRightLeft,
  HiOutlineWrenchScrewdriver,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineArrowRightOnRectangle,
  HiOutlineQrCode,
} from 'react-icons/hi2';

export default function Layout({ children }) {
  const { user, logout, isAuthenticated, isITStaff } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: <HiOutlineSquares2X2 /> },
    { href: '/assets', label: 'Tài sản', icon: <HiOutlineComputerDesktop /> },
    { href: '/assignments', label: 'Phân bổ', icon: <HiOutlineArrowsRightLeft /> },
    ...(isITStaff
      ? [
          { href: '/maintenance', label: 'Bảo trì', icon: <HiOutlineWrenchScrewdriver /> },
          { href: '/users', label: 'Người dùng', icon: <HiOutlineUsers /> },
          { href: '/reports', label: 'Báo cáo', icon: <HiOutlineChartBar /> },
        ]
      : []),
  ];

  const isActive = (href) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  const initials = (user?.full_name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link href="/">IT Asset Management</Link>
        </div>

        <ul className="navbar-menu">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href) ? 'active' : ''}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-user">
          <Link href="/assets/scan" title="Quét mã QR tài sản" className="theme-toggle">
            <HiOutlineQrCode />
          </Link>
          <ThemeToggle />
          <div className="navbar-avatar">{initials}</div>
          <span>
            {user?.full_name}
            <span style={{ opacity: 0.6, fontWeight: 400 }}> ({roleLabel(user?.role)})</span>
          </span>
          <button onClick={handleLogout} className="btn btn-sm">
            <HiOutlineArrowRightOnRectangle />
            Đăng xuất
          </button>
        </div>
      </nav>

      <main className="container">{children}</main>

      <ChatBot />
    </div>
  );
}