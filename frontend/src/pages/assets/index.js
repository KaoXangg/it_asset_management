import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { assetsAPI, assetImageUrl } from '../../lib/api';
import { assetStatusLabel, assetTypeLabel } from '../../lib/labels';
import { TableSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import useDebouncedValue from '../../lib/useDebouncedValue';
import { HiOutlineInbox, HiOutlineQrCode } from 'react-icons/hi2';

export default function Assets() {
  const { isAuthenticated, loading, isITStaff } = useAuth();
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Chỉ gọi API sau khi người dùng ngừng gõ 400ms, tránh spam request theo từng ký tự
  const debouncedSearch = useDebouncedValue(search, 400);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Đổi bộ lọc/tìm kiếm thì quay về trang 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, debouncedSearch, statusFilter, typeFilter, page]);

  const fetchAssets = async () => {
    setLoadingAssets(true);
    try {
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const response = await assetsAPI.getAll(params);
      setAssets(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Không tải được danh sách tài sản');
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tài sản này?')) return;

    try {
      await assetsAPI.delete(id);
      toast.success('Đã xóa tài sản');
      fetchAssets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi xóa tài sản');
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="page-loading"><span className="spinner" /> Đang tải...</div>;
  }

  return (
    <Layout>
      <div className="flex-between mb-20">
        <h1>Quản lý tài sản</h1>
        <div className="flex gap-10">
          <Link href="/assets/scan">
            <button className="btn">
              <HiOutlineQrCode style={{ marginRight: '6px' }} />
              Quét QR
            </button>
          </Link>
          {isITStaff && (
            <Link href="/assets/create">
              <button className="btn btn-primary">Thêm tài sản</button>
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên, mã, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="available">Sẵn sàng</option>
            <option value="in_use">Đang dùng</option>
            <option value="maintenance">Đang bảo trì</option>
            <option value="broken">Hỏng</option>
            <option value="disposed">Đã thanh lý</option>
          </select>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại</option>
            <option value="laptop">Laptop</option>
            <option value="desktop">Máy bàn</option>
            <option value="monitor">Màn hình</option>
            <option value="printer">Máy in</option>
            <option value="phone">Điện thoại</option>
            <option value="tablet">Máy tính bảng</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {loadingAssets ? (
          <TableSkeleton rows={5} cols={8} />
        ) : assets.length === 0 ? (
          <EmptyState
            icon={<HiOutlineInbox />}
            title="Chưa có tài sản nào"
            description="Thêm tài sản mới hoặc thử thay đổi bộ lọc tìm kiếm."
          />
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Mã tài sản</th>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Người dùng</th>
                  <th>Vị trí</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>
                      {asset.image_url ? (
                        <img
                          src={assetImageUrl(asset.image_url)}
                          alt={asset.name}
                          style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--color-muted-bg)' }} />
                      )}
                    </td>
                    <td>{asset.asset_code}</td>
                    <td>{asset.name}</td>
                    <td>{assetTypeLabel(asset.type)}</td>
                    <td>
                      <span className={`badge badge-${asset.status}`}>
                        {assetStatusLabel(asset.status)}
                      </span>
                    </td>
                    <td>{asset.assigned_to_name || '-'}</td>
                    <td>{asset.location || '-'}</td>
                    <td>
                      <div className="flex gap-10">
                        <Link href={`/assets/${asset.id}`}>
                          <button className="btn btn-sm">Xem</button>
                        </Link>
                        {isITStaff && (
                          <>
                            <Link href={`/assets/${asset.id}/edit`}>
                              <button className="btn btn-sm">Sửa</button>
                            </Link>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(asset.id)}
                            >
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
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
