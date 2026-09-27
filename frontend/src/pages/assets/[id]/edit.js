import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { assetsAPI, assetImageUrl } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function EditAsset() {
  const router = useRouter();
  const { id } = router.query;
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await assetsAPI.getById(id);
      // Format dates for input[type=date]
      if (response.data.purchase_date) {
        response.data.purchase_date = response.data.purchase_date.split('T')[0];
      }
      if (response.data.warranty_expiry) {
        response.data.warranty_expiry = response.data.warranty_expiry.split('T')[0];
      }
      setFormData(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu tài sản');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const response = await assetsAPI.uploadImage(id, file);
      setFormData((prev) => ({ ...prev, image_url: response.data.image_url }));
      toast.success('Đã cập nhật ảnh tài sản');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Lỗi khi upload ảnh');
    } finally {
      setUploadingImage(false);
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
      await assetsAPI.update(id, formData);
      toast.success('Đã cập nhật tài sản');
      router.push(`/assets/${id}`);
    } catch (err) {
      const details = err.response?.data?.details;
      const message = details?.[0]?.message || err.response?.data?.error || 'Lỗi khi cập nhật tài sản';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return <Layout><div className="page-loading"><span className="spinner" /> Đang tải...</div></Layout>;
  }

  return (
    <Layout>
      <h1 className="mb-20">Chỉnh sửa tài sản</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-20">
            <label className="form-label">Ảnh thiết bị</label>
            <div className="flex gap-10" style={{ alignItems: 'center' }}>
              {formData.image_url && (
                <img
                  src={assetImageUrl(formData.image_url)}
                  alt={formData.name}
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploadingImage} />
              {uploadingImage && <span className="spinner" />}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Mã tài sản</label>
              <input
                type="text"
                className="form-control"
                value={formData.asset_code}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tên tài sản *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loại *</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="laptop">Laptop</option>
                <option value="desktop">Máy bàn</option>
                <option value="monitor">Màn hình</option>
                <option value="printer">Máy in</option>
                <option value="phone">Điện thoại</option>
                <option value="tablet">Máy tính bảng</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Thương hiệu</label>
              <input
                type="text"
                name="brand"
                className="form-control"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text"
                name="model"
                className="form-control"
                value={formData.model}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Serial Number</label>
              <input
                type="text"
                name="serial_number"
                className="form-control"
                value={formData.serial_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ngày mua</label>
              <input
                type="date"
                name="purchase_date"
                className="form-control"
                value={formData.purchase_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hết bảo hành</label>
              <input
                type="date"
                name="warranty_expiry"
                className="form-control"
                value={formData.warranty_expiry}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá mua</label>
              <input
                type="number"
                name="purchase_price"
                className="form-control"
                value={formData.purchase_price}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá hiện tại</label>
              <input
                type="number"
                name="current_value"
                className="form-control"
                value={formData.current_value}
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
                <option value="available">Sẵn sàng</option>
                <option value="in_use">Đang dùng</option>
                <option value="maintenance">Đang bảo trì</option>
                <option value="broken">Hỏng</option>
                <option value="disposed">Đã thanh lý</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tình trạng</label>
              <select
                name="condition_status"
                className="form-select"
                value={formData.condition_status}
                onChange={handleChange}
              >
                <option value="new">Mới</option>
                <option value="good">Tốt</option>
                <option value="fair">Trung bình</option>
                <option value="poor">Kém</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Vị trí</label>
            <input
              type="text"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
            />
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
              onClick={() => router.push(`/assets/${id}`)}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}