import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { assignmentsAPI, assetsAPI, usersAPI } from '../../lib/api';

export default function CreateAssignment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    asset_id: '',
    user_id: '',
    assigned_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchUsers();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await assetsAPI.getAll({ status: 'available', all: true });
      setAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
      await assignmentsAPI.create(formData);
      router.push('/assignments');
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi tạo phân bổ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="mb-20">Phân bổ tài sản</h1>

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
            <label className="form-label">Người dùng *</label>
            <select
              name="user_id"
              className="form-select"
              value={formData.user_id}
              onChange={handleChange}
              required
            >
              <option value="">Chọn người dùng</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày phân bổ *</label>
            <input
              type="date"
              name="assigned_date"
              className="form-control"
              value={formData.assigned_date}
              onChange={handleChange}
              required
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
              {loading ? 'Đang lưu...' : 'Phân bổ'}
            </button>
            <button 
              type="button" 
              className="btn" 
              onClick={() => router.push('/assignments')}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

