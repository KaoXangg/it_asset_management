/**
 * EmptyState — thay cho dòng "Không có dữ liệu" trơ trọi trong bảng.
 * Dùng: <EmptyState icon={<HiOutlineInbox />} title="Chưa có tài sản" description="..." action={<button>...</button>} />
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="mt-20">{action}</div>}
    </div>
  );
}
