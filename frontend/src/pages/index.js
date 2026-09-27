import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { reportsAPI } from '../lib/api';
import Link from 'next/link';
import { formatDate, formatDateTime, formatCurrency } from '../lib/utils';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import {
  HiOutlineComputerDesktop,
  HiOutlineBanknotes,
  HiOutlineArrowsRightLeft,
  HiOutlineWrenchScrewdriver,
  HiOutlineExclamationTriangle,
  HiOutlinePlusCircle,
  HiOutlineQrCode,
  HiOutlineDocumentChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineInbox,
} from 'react-icons/hi2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const STATUS_LABELS = {
  available: 'Sẵn sàng',
  in_use: 'Đang dùng',
  maintenance: 'Bảo trì',
  broken: 'Hỏng',
  disposed: 'Thanh lý',
};

const TYPE_LABELS = {
  laptop: 'Laptop',
  desktop: 'Máy bàn',
  monitor: 'Màn hình',
  printer: 'Máy in',
  phone: 'Điện thoại',
  tablet: 'Máy tính bảng',
  other: 'Khác',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, isITStaff } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [dueMaintenance, setDueMaintenance] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, dueMaintenanceRes] = await Promise.all([
        reportsAPI.getDashboard(),
        isITStaff ? reportsAPI.getDueMaintenance() : Promise.resolve({ data: [] }),
      ]);
      setStats(statsRes.data);
      setDueMaintenance(dueMaintenanceRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="page-loading"><span className="spinner" /> Đang tải...</div>;
  }

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Layout>
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <h1>{greeting()}, {user?.full_name?.split(' ').slice(-1)[0] || user?.username}</h1>
          <p style={{ textTransform: 'capitalize' }}>{today}</p>
        </div>
        <div className="quick-actions">
          <Link href="/assets/scan">
            <button className="btn">
              <HiOutlineQrCode style={{ marginRight: 6 }} />
              Quét QR
            </button>
          </Link>
          {isITStaff && (
            <>
              <Link href="/assets/create">
                <button className="btn">
                  <HiOutlinePlusCircle style={{ marginRight: 6 }} />
                  Thêm tài sản
                </button>
              </Link>
              <Link href="/reports">
                <button className="btn btn-primary">
                  <HiOutlineDocumentChartBar style={{ marginRight: 6 }} />
                  Xuất báo cáo
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {loadingData ? (
        <CardSkeleton count={5} />
      ) : stats ? (
        <>
          <div className="stat-grid">
            <div className="stat-card accent-primary">
              <div className="stat-card-icon"><HiOutlineComputerDesktop /></div>
              <div>
                <div className="stat-card-value">{stats.totalAssets}</div>
                <div className="stat-card-label">Tổng tài sản</div>
              </div>
            </div>
            <div className="stat-card accent-success">
              <div className="stat-card-icon"><HiOutlineBanknotes /></div>
              <div>
                <div className="stat-card-value" style={{ fontSize: 17 }}>{formatCurrency(stats.totalValue)}</div>
                <div className="stat-card-label">Tổng giá trị</div>
              </div>
            </div>
            <div className="stat-card accent-info">
              <div className="stat-card-icon"><HiOutlineArrowsRightLeft /></div>
              <div>
                <div className="stat-card-value">{stats.activeAssignments}</div>
                <div className="stat-card-label">Đang phân bổ</div>
              </div>
            </div>
            <div className="stat-card accent-warning">
              <div className="stat-card-icon"><HiOutlineWrenchScrewdriver /></div>
              <div>
                <div className="stat-card-value">{stats.pendingMaintenance}</div>
                <div className="stat-card-label">Đang bảo trì</div>
              </div>
            </div>
            <div className="stat-card accent-danger">
              <div className="stat-card-icon"><HiOutlineExclamationTriangle /></div>
              <div>
                <div className="stat-card-value">{stats.expiringWarranty}</div>
                <div className="stat-card-label">Sắp hết bảo hành</div>
              </div>
            </div>
          </div>

          {isITStaff && (
            <div className="card mb-20">
              <div className="card-header">
                <span>Tài sản cần bảo trì</span>
                <HiOutlineWrenchScrewdriver style={{ color: 'var(--text-secondary)' }} />
              </div>
              {dueMaintenance.length === 0 ? (
                <EmptyState
                  icon={<HiOutlineClipboardDocumentList />}
                  title="Không có tài sản nào cần bảo trì"
                  description="Mọi thiết bị đều đã được bảo trì trong 6 tháng gần đây."
                />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Mã tài sản</th>
                      <th>Tên</th>
                      <th>Lần cuối bảo trì</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dueMaintenance.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.asset_code}</td>
                        <td>{asset.name}</td>
                        <td>{formatDate(asset.last_maintenance_date)}</td>
                        <td>
                          <Link href={`/maintenance/create?asset_id=${asset.id}`}>
                            <button className="btn btn-sm">Tạo bảo trì</button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <div className="card-header">Tài sản theo trạng thái</div>
              {stats.byStatus.length === 0 ? (
                <EmptyState icon={<HiOutlineInbox />} title="Chưa có dữ liệu" />
              ) : (
                <div style={{ padding: '20px', height: '300px' }}>
                  <Doughnut
                    data={{
                      labels: stats.byStatus.map((item) => STATUS_LABELS[item.status] || item.status),
                      datasets: [
                        {
                          data: stats.byStatus.map((item) => item.count),
                          backgroundColor: ['#4ade80', '#3b82f6', '#fbbf24', '#ef4444', '#6b7280'],
                          borderWidth: 2,
                          borderColor: 'var(--bg-surface)',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                    }}
                  />
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">Tài sản theo loại</div>
              {stats.byType.length === 0 ? (
                <EmptyState icon={<HiOutlineInbox />} title="Chưa có dữ liệu" />
              ) : (
                <div style={{ padding: '20px', height: '300px' }}>
                  <Bar
                    data={{
                      labels: stats.byType.map((item) => TYPE_LABELS[item.type] || item.type),
                      datasets: [
                        {
                          label: 'Số lượng',
                          data: stats.byType.map((item) => item.count),
                          backgroundColor: '#6366f1',
                          borderRadius: 6,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="card mt-20">
            <div className="card-header">Hoạt động gần đây</div>
            {loadingData ? (
              <TableSkeleton rows={4} cols={4} />
            ) : stats.recentActivities.length === 0 ? (
              <EmptyState icon={<HiOutlineClipboardDocumentList />} title="Chưa có hoạt động nào" />
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Hành động</th>
                    <th>Mô tả</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>{activity.user_name || 'N/A'}</td>
                      <td>{activity.action}</td>
                      <td>{activity.description}</td>
                      <td>{formatDateTime(activity.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <EmptyState icon={<HiOutlineInbox />} title="Không thể tải dữ liệu" description="Vui lòng thử tải lại trang." />
      )}
    </Layout>
  );
}
