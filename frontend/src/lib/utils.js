// Format date to Vietnamese format (dd/mm/yyyy)
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format datetime to Vietnamese format (dd/mm/yyyy HH:mm)
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Format currency to Vietnamese format (1.000.000 VNĐ)
export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
};

// Format number with thousand separator
export const formatNumber = (number) => {
  if (!number) return '0';
  return new Intl.NumberFormat('vi-VN').format(number);
};
