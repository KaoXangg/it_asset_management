// Ánh xạ các giá trị enum (tiếng Anh, lưu trong DB) sang nhãn hiển thị tiếng Việt

export const ASSET_STATUS_LABELS = {
  available: 'Sẵn sàng',
  in_use: 'Đang dùng',
  maintenance: 'Đang bảo trì',
  broken: 'Hỏng',
  disposed: 'Đã thanh lý',
};

export const ASSET_TYPE_LABELS = {
  laptop: 'Laptop',
  desktop: 'Máy bàn',
  monitor: 'Màn hình',
  printer: 'Máy in',
  phone: 'Điện thoại',
  tablet: 'Máy tính bảng',
  other: 'Khác',
};

export const CONDITION_STATUS_LABELS = {
  new: 'Mới',
  good: 'Tốt',
  fair: 'Trung bình',
  poor: 'Kém',
};

export const MAINTENANCE_TYPE_LABELS = {
  repair: 'Sửa chữa',
  inspection: 'Kiểm tra',
  upgrade: 'Nâng cấp',
  cleaning: 'Vệ sinh',
  other: 'Khác',
};

export const MAINTENANCE_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  in_progress: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const ASSIGNMENT_STATUS_LABELS = {
  active: 'Đang sử dụng',
  returned: 'Đã trả',
  overdue: 'Quá hạn',
};

export const ROLE_LABELS = {
  admin: 'Quản trị viên',
  it_staff: 'Nhân viên IT',
  regular_user: 'Người dùng',
};

const fallback = (map, value) => map[value] || value || '-';

export const assetStatusLabel = (v) => fallback(ASSET_STATUS_LABELS, v);
export const assetTypeLabel = (v) => fallback(ASSET_TYPE_LABELS, v);
export const conditionStatusLabel = (v) => fallback(CONDITION_STATUS_LABELS, v);
export const maintenanceTypeLabel = (v) => fallback(MAINTENANCE_TYPE_LABELS, v);
export const maintenanceStatusLabel = (v) => fallback(MAINTENANCE_STATUS_LABELS, v);
export const assignmentStatusLabel = (v) => fallback(ASSIGNMENT_STATUS_LABELS, v);
export const roleLabel = (v) => fallback(ROLE_LABELS, v);