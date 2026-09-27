import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { assignmentsAPI } from '../../lib/api';
import { assignmentStatusLabel } from '../../lib/labels';
import { formatDate } from '../../lib/utils';
import { TableSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { HiOutlineArrowsRightLeft } from 'react-icons/hi2';

export default function Assignments() {
  const { isAuthenticated, loading, isITStaff } = useAuth();
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
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
      fetchAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, statusFilter, page]);

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const response = await assignmentsAPI.getAll(params);
      setAssignments(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleReturn = async (id) => {
    const returnDate = prompt('Nhập ngày trả (YYYY-MM-DD):');
    if (!returnDate) return;

    try {
      await assignmentsAPI.returnAsset(id, { return_date: returnDate });
      toast.success('Đã ghi nhận trả tài sản');
      fetchAssignments();
    } catch (error) {
      toast.error('Lỗi khi trả tài sản');
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="page-loading"><span className="spinner" /> Đang tải...</div>;
  }

  return (
    <Layout>
      <div className="flex-between mb-20">
        <h1>Quản lý phân bổ</h1>
        {isITStaff && (
          <Link href="/assignments/create">
            <button className="btn btn-primary">Phân bổ tài sản</button>
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
            <option value="active">Đang sử dụng</option>
            <option value="returned">Đã trả</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>

        {loadingAssignments ? (
          <TableSkeleton rows={5} cols={8} />
        ) : assignments.length === 0 ? (
          <EmptyState
            icon={<HiOutlineArrowsRightLeft />}
            title="Chưa có phân bổ nào"
            description="Phân bổ tài sản đầu tiên cho một người dùng."
          />
        ) : (
          <>
            <table className="table">
            <thead>
              <tr>
                <th>Mã tài sản</th>
                <th>Tên tài sản</th>
                <th>Người dùng</th>
                <th>Ngày phân bổ</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Người phân bổ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.asset_code}</td>
                  <td>{assignment.asset_name}</td>
                  <td>{assignment.user_name}</td>
                  <td>{formatDate(assignment.assigned_date)}</td>
                  <td>{formatDate(assignment.return_date)}</td>
                  <td>
                    <span className={`badge badge-${assignment.status}`}>
                      {assignmentStatusLabel(assignment.status)}
                    </span>
                  </td>
                  <td>{assignment.assigned_by_name || '-'}</td>
                  <td>
                    {isITStaff && assignment.status === 'active' && (
                      <button 
                        className="btn btn-sm"
                        onClick={() => handleReturn(assignment.id)}
                      >
                        Trả lại
                      </button>
                    )}
                  </td>
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