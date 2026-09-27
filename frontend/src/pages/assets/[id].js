import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { assetsAPI, assetImageUrl } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { assetStatusLabel, assetTypeLabel, conditionStatusLabel, assignmentStatusLabel, maintenanceTypeLabel, maintenanceStatusLabel } from '../../lib/labels';
import { formatDate, formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';
import { HiOutlineArrowPath, HiOutlineArrowDownTray, HiOutlinePrinter } from 'react-icons/hi2';

export default function AssetDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isITStaff } = useAuth();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQr, setGeneratingQr] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAsset();
    }
  }, [id]);

  const fetchAsset = async () => {
    try {
      const response = await assetsAPI.getById(id);
      setAsset(response.data);
    } catch (error) {
      console.error('Error fetching asset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQr = async () => {
    setGeneratingQr(true);
    try {
      const response = await assetsAPI.regenerateQrCode(id);
      setAsset((prev) => ({ ...prev, qr_code: response.data.qr_code }));
      toast.success('Đã tạo lại mã QR');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Lỗi khi tạo mã QR');
    } finally {
      setGeneratingQr(false);
    }
  };

  const handlePrintQr = () => {
    const win = window.open('', '_blank', 'width=400,height=500');
    win.document.write(`
      <html>
        <head><title>QR - ${asset.asset_code}</title></head>
        <body style="text-align:center;font-family:sans-serif;padding:24px;">
          <img src="${asset.qr_code}" style="width:240px;height:240px;" />
          <p style="font-weight:bold;font-size:18px;margin-top:12px;">${asset.asset_code}</p>
          <p style="color:#555;">${asset.name}</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  if (loading) {
    return <Layout><div className="page-loading"><span className="spinner" /> Đang tải...</div></Layout>;
  }

  if (!asset) {
    return <Layout><div>Không tìm thấy tài sản</div></Layout>;
  }

  return (
    <Layout>
      <div className="flex-between mb-20">
        <h1>Chi tiết tài sản</h1>
        <button className="btn" onClick={() => router.push('/assets')}>
          Quay lại
        </button>
      </div>

      <div className="card">
        <div className="card-header">Thông tin cơ bản</div>
        
        {asset.qr_code ? (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <img src={asset.qr_code} alt="QR Code" style={{ width: '200px', height: '200px' }} />
            <div className="flex gap-10 mt-20" style={{ justifyContent: 'center' }}>
              <a href={asset.qr_code} download={`qr-${asset.asset_code}.png`} className="btn btn-sm">
                <HiOutlineArrowDownTray style={{ marginRight: '4px' }} />
                Tải QR
              </a>
              <button className="btn btn-sm" onClick={handlePrintQr}>
                <HiOutlinePrinter style={{ marginRight: '4px' }} />
                In QR
              </button>
              {isITStaff && (
                <button className="btn btn-sm" onClick={handleRegenerateQr} disabled={generatingQr}>
                  <HiOutlineArrowPath style={{ marginRight: '4px' }} />
                  {generatingQr ? 'Đang tạo...' : 'Tạo lại mã QR'}
                </button>
              )}
            </div>
          </div>
        ) : (
          isITStaff && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <p className="text-secondary mb-20">Tài sản này chưa có mã QR.</p>
              <button className="btn btn-primary btn-sm" onClick={handleRegenerateQr} disabled={generatingQr}>
                {generatingQr ? 'Đang tạo...' : 'Tạo mã QR'}
              </button>
            </div>
          )
        )}

        {asset.image_url && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <img
              src={assetImageUrl(asset.image_url)}
              alt={asset.name}
              style={{ maxWidth: '280px', maxHeight: '280px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            />
          </div>
        )}

        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold', width: '200px' }}>Mã tài sản:</td>
              <td style={{ padding: '10px' }}>{asset.asset_code}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Tên:</td>
              <td style={{ padding: '10px' }}>{asset.name}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Loại:</td>
              <td style={{ padding: '10px' }}>{assetTypeLabel(asset.type)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Danh mục:</td>
              <td style={{ padding: '10px' }}>{asset.category_name || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Thương hiệu:</td>
              <td style={{ padding: '10px' }}>{asset.brand || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Model:</td>
              <td style={{ padding: '10px' }}>{asset.model || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Serial Number:</td>
              <td style={{ padding: '10px' }}>{asset.serial_number || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Trạng thái:</td>
              <td style={{ padding: '10px' }}>
                <span className={`badge badge-${asset.status}`}>{assetStatusLabel(asset.status)}</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Tình trạng:</td>
              <td style={{ padding: '10px' }}>{conditionStatusLabel(asset.condition_status)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Ngày mua:</td>
              <td style={{ padding: '10px' }}>{formatDate(asset.purchase_date)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Hết bảo hành:</td>
              <td style={{ padding: '10px' }}>{formatDate(asset.warranty_expiry)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Giá mua:</td>
              <td style={{ padding: '10px' }}>{formatCurrency(asset.purchase_price)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Giá hiện tại:</td>
              <td style={{ padding: '10px' }}>{formatCurrency(asset.current_value)}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Vị trí:</td>
              <td style={{ padding: '10px' }}>{asset.location || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', fontWeight: 'bold' }}>Ghi chú:</td>
              <td style={{ padding: '10px' }}>{asset.notes || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {asset.assignments && asset.assignments.length > 0 && (
        <div className="card mt-20">
          <div className="card-header">Lịch sử phân bổ</div>
          <table className="table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Ngày phân bổ</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Người phân bổ</th>
              </tr>
            </thead>
            <tbody>
              {asset.assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>{assignment.user_name}</td>
                  <td>{formatDate(assignment.assigned_date)}</td>
                  <td>{formatDate(assignment.return_date)}</td>
                  <td>{assignmentStatusLabel(assignment.status)}</td>
                  <td>{assignment.assigned_by_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {asset.maintenance && asset.maintenance.length > 0 && (
        <div className="card mt-20">
          <div className="card-header">Lịch sử bảo trì</div>
          <table className="table">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Ngày</th>
                <th>Chi phí</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {asset.maintenance.map((record) => (
                <tr key={record.id}>
                  <td>{maintenanceTypeLabel(record.maintenance_type)}</td>
                  <td>{record.description}</td>
                  <td>{formatDate(record.maintenance_date)}</td>
                  <td>{formatCurrency(record.cost)}</td>
                  <td>{maintenanceStatusLabel(record.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}