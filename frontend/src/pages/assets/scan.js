import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { assetsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlineQrCode, HiOutlineCamera } from 'react-icons/hi2';

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

export default function ScanAsset() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const scannerRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | scanning | looking-up | error
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Khởi động camera khi vào trang, dọn dẹp khi rời trang
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    let html5QrCode;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = html5QrCode;
        setStatus('scanning');

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleDecoded(decodedText),
          () => {
            /* lỗi quét từng frame — bỏ qua, chỉ log khi không tìm thấy QR trong khung hình */
          }
        );
      } catch (err) {
        console.error('Không thể mở camera:', err);
        setCameraError(
          'Không thể mở camera. Hãy cấp quyền truy cập camera cho trình duyệt, hoặc nhập mã tài sản thủ công bên dưới.'
        );
        setStatus('error');
      }
    })();

    return () => {
      isMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner && scanner.isScanning) {
      try {
        await scanner.stop();
      } catch {
        /* noop */
      }
    }
  };

  const lookupCode = async (code) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setStatus('looking-up');
    try {
      const response = await assetsAPI.getByCode(trimmed);
      await stopScanner();
      toast.success(`Đã tìm thấy: ${response.data.name}`);
      router.push(`/assets/${response.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Không tìm thấy tài sản với mã này');
      setStatus('scanning');
    }
  };

  const handleDecoded = (decodedText) => {
    // Tránh gọi API nhiều lần liên tục khi camera vẫn đang thấy cùng 1 mã QR
    if (status === 'looking-up') return;
    lookupCode(decodedText);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    lookupCode(manualCode);
  };

  if (loading || !isAuthenticated) {
    return (
      <Layout>
        <div className="page-loading">
          <span className="spinner" /> Đang tải...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="mb-20">
        <HiOutlineQrCode style={{ verticalAlign: '-3px', marginRight: '8px' }} />
        Quét mã QR tài sản
      </h1>

      <div className="card" style={{ maxWidth: 480, margin: '0 auto' }}>
        <p className="text-secondary mb-20">
          Hướng camera vào mã QR dán trên tài sản để mở nhanh thông tin chi tiết.
        </p>

        <div
          id={SCANNER_ELEMENT_ID}
          style={{
            width: '100%',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: 'var(--color-muted-bg)',
            minHeight: 260,
          }}
        />

        {status === 'looking-up' && (
          <div className="flex gap-10 mt-20" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <span className="spinner" /> Đang tra cứu...
          </div>
        )}

        {cameraError && (
          <div className="error mt-20">
            <HiOutlineCamera style={{ marginRight: '6px' }} />
            {cameraError}
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="mt-20">
          <label className="form-label">Hoặc nhập mã tài sản thủ công</label>
          <div className="flex gap-10">
            <input
              type="text"
              className="form-control"
              placeholder="Ví dụ: LT001"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={status === 'looking-up'}>
              Tìm
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
