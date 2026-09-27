import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { reportsAPI } from '../../lib/api';
import { formatDateTime, formatCurrency } from '../../lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const { isAuthenticated, loading, isITStaff } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [maintenanceCost, setMaintenanceCost] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && isITStaff) {
      fetchData();
    }
  }, [isAuthenticated, isITStaff, filters]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const logParams = {};
      if (filters.startDate) logParams.start_date = filters.startDate;
      if (filters.endDate) logParams.end_date = filters.endDate;

      const costParams = { year: filters.year };

      const [logsRes, costRes] = await Promise.all([
        reportsAPI.getActivityLogs(logParams),
        reportsAPI.getMaintenanceCost(costParams),
      ]);

      setLogs(logsRes.data);
      setMaintenanceCost(costRes.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = async (fetcher, filename, successMsg) => {
    try {
      const response = await fetcher();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(successMsg);
    } catch (error) {
      toast.error('Lỗi khi xuất báo cáo');
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="page-loading"><span className="spinner" /> Đang tải...</div>;
  }

  if (!isITStaff) {
    return <Layout><div>Bạn không có quyền truy cập trang này</div></Layout>;
  }

  return (
    <Layout>
      <div className="flex-between mb-20">
        <h1>Báo cáo & Nhật ký</h1>
        <div className="flex gap-10">
          <button className="btn" onClick={() => handleExport(reportsAPI.exportAssets, 'assets-report.xlsx', 'Đã xuất Excel tài sản')}>
            Excel Tài sản
          </button>
          <button className="btn" onClick={() => handleExport(reportsAPI.exportAssignments, 'assignments-report.xlsx', 'Đã xuất Excel phân bổ')}>
            Excel Phân bổ
          </button>
          <button className="btn" onClick={() => handleExport(reportsAPI.exportMaintenance, 'maintenance-report.xlsx', 'Đã xuất Excel bảo trì')}>
            Excel Bảo trì
          </button>
          <button className="btn btn-primary" onClick={() => handleExport(reportsAPI.exportDashboardPDF, 'dashboard-report.pdf', 'Đã xuất PDF tổng quan')}>
            PDF Tổng quan
          </button>
        </div>
      </div>

      <div className="card mb-20">
        <div className="card-header">Chi phí bảo trì</div>
        <div className="form-group" style={{ width: '200px', margin: '15px 0' }}>
          <label className="form-label">Chọn năm</label>
          <input
            type="number"
            name="year"
            className="form-control"
            value={filters.year}
            onChange={handleFilterChange}
          />
        </div>
        {loadingData ? (
          <div>Đang tải...</div>
        ) : maintenanceCost.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Không có dữ liệu cho năm {filters.year}
          </div>
        ) : (
          <>
            <div style={{ padding: '20px', height: '300px' }}>
              <Line
                data={{
                  labels: maintenanceCost.map(item => {
                    const [year, month] = item.month.split('-');
                    return `Tháng ${month}/${year}`;
                  }),
                  datasets: [{
                    label: 'Chi phí bảo trì (VNĐ)',
                    data: maintenanceCost.map(item => parseFloat(item.total_cost)),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top'
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return 'Chi phí: ' + new Intl.NumberFormat('vi-VN').format(context.parsed.y) + ' VNĐ';
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return new Intl.NumberFormat('vi-VN', { notation: 'compact' }).format(value);
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Tháng</th>
                  <th>Số lượt bảo trì</th>
                  <th>Tổng chi phí</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceCost.map((item) => (
                  <tr key={item.month}>
                    <td>{item.month}</td>
                    <td>{item.total_records}</td>
                    <td>{formatCurrency(item.total_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">Nhật ký hoạt động</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
          <div className="form-group">
            <label className="form-label">Từ ngày</label>
            <input
              type="date"
              name="startDate"
              className="form-control"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Đến ngày</label>
            <input
              type="date"
              name="endDate"
              className="form-control"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        {loadingData ? (
          <div>Đang tải...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người dùng</th>
                <th>Hành động</th>
                <th>Mô tả</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">Không có nhật ký nào</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDateTime(log.created_at)}</td>
                    <td>{log.user_name || '-'}</td>
                    <td>{log.action}</td>
                    <td>{log.description}</td>
                    <td>{log.ip_address || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}