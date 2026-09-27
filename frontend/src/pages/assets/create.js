import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { assetsAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export default function CreateAsset() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    asset_code: '',
    name: '',
    type: 'laptop',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    purchase_price: '',
    current_value: '',
    location: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
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
      const response = await assetsAPI.create(formData);
      if (imageFile && response.data?.assetId) {
        try {
          await assetsAPI.uploadImage(response.data.assetId, imageFile);
        } catch {
          toast.error('Tạo tài sản thành công nhưng upload ảnh thất bại, bạn có thể thêm ảnh sau ở trang chi tiết');
        }
      }
      toast.success('Đã tạo tài sản mới');
      router.push('/assets');
    } catch (err) {
      const details = err.response?.data?.details;
      const message = details?.[0]?.message || err.response?.data?.error || 'Lỗi khi tạo tài sản';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="mb-20">Thêm tài sản mới</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-20">
            <label className="form-label">Ảnh thiết bị</label>
            <div className="flex gap-10" style={{ alignItems: 'center' }}>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Xem trước"
                  style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                />
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Mã tài sản *</label>
              <input
                type="text"
                name="asset_code"
                className="form-control"
                value={formData.asset_code}
                onChange={handleChange}
                required
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
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => router.push('/assets')}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}