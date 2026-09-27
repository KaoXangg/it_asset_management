import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { maintenanceAPI, assetsAPI } from '../../../lib/api';

export default function EditMaintenance() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState(null);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMaintenanceRecord();
      fetchAssets();
    }
  }, [id]);

  const fetchMaintenanceRecord = async () => {
    try {
      const response = await maintenanceAPI.getById(id);
      if (response.data.maintenance_date) {
        response.data.maintenance_date = response.data.maintenance_date.split('T')[0];
      }
      setFormData(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu bảo trì');
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await assetsAPI.getAll({ all: true });
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await maintenanceAPI.update(id, formData);
      router.push('/maintenance');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cập nhật bảo trì');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return <Layout><div className="page-loading"><span className="spinner" /> Đang tải...</div></Layout>;
  }

  return (
    <Layout>
      <h1 className="mb-20">Chỉnh sửa bảo trì</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tài sản *</label>
            <select
              name="asset_id"
              className="form-select"
              value={formData.asset_id}
              onChange={handleChange}
              required
              disabled
            >
              <option value="">Chọn tài sản</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.asset_code} - {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Loại bảo trì *</label>
            <select
              name="maintenance_type"
              className="form-select"
              value={formData.maintenance_type}
              onChange={handleChange}
              required
            >
              <option value="repair">Sửa chữa</option>
              <option value="inspection">Kiểm tra</option>
              <option value="upgrade">Nâng cấp</option>
              <option value="cleaning">Vệ sinh</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả *</label>
            <textarea
              name="description"
              className="form-control"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Ngày bảo trì *</label>
              <input
                type="date"
                name="maintenance_date"
                className="form-control"
                value={formData.maintenance_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chi phí</label>
              <input
                type="number"
                name="cost"
                className="form-control"
                value={formData.cost}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Người thực hiện</label>
            <input
              type="text"
              name="performed_by"
              className="form-control"
              value={formData.performed_by}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Chờ xử lý</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ghi chú</label>
            <textarea
              name="notes"
              className="form-control"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="flex gap-10 mt-20">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => router.push('/maintenance')}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}