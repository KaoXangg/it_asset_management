import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { maintenanceAPI } from '../../lib/api';
import { maintenanceTypeLabel, maintenanceStatusLabel } from '../../lib/labels';
import { formatDate, formatCurrency } from '../../lib/utils';
import { TableSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';

export default function Maintenance() {
  const { isAuthenticated, loading, isITStaff } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, statusFilter, page]);

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const response = await maintenanceAPI.getAll(params);
      setRecords(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await maintenanceAPI.update(id, { status: 'completed' });
      toast.success('Đã đánh dấu hoàn thành bảo trì');
      fetchRecords();
    } catch (error) {
      toast.error('Lỗi khi cập nhật bảo trì');
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="page-loading"><span className="spinner" /> Đang tải...</div>;
  }

  return (
    <Layout>
      <div className="flex-between mb-20">
        <h1>Quản lý bảo trì</h1>
        {isITStaff && (
          <Link href="/maintenance/create">
            <button className="btn btn-primary">Thêm bảo trì</button>
          </Link>
        )}
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {loadingRecords ? (
          <TableSkeleton rows={5} cols={7} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={<HiOutlineWrenchScrewdriver />}
            title="Chưa có bản ghi bảo trì nào"
            description="Tạo bản ghi bảo trì đầu tiên cho một tài sản."
          />
        ) : (
          <>
            <table className="table">
            <thead>
              <tr>
                <th>Mã tài sản</th>
                <th>Tên tài sản</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Ngày</th>
                <th>Chi phí</th>
                <th>Trạng thái</th>
                {isITStaff && <th>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.asset_code}</td>
                  <td>{record.asset_name}</td>
                  <td>{maintenanceTypeLabel(record.maintenance_type)}</td>
                  <td>{record.description}</td>
                  <td>{formatDate(record.maintenance_date)}</td>
                  <td>{formatCurrency(record.cost)}</td>
                  <td>
                    <span className={`badge badge-${record.status}`}>
                      {maintenanceStatusLabel(record.status)}
                    </span>
                  </td>
                  {isITStaff && (
                    <td>
                      <div className="flex gap-10">
                        <Link href={`/maintenance/${record.id}/edit`}>
                          <button className="btn btn-sm">Sửa</button>
                        </Link>
                        {record.status !== 'completed' && record.status !== 'cancelled' && (
                          <button className="btn btn-sm" onClick={() => handleMarkCompleted(record.id)}>
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            </table>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
