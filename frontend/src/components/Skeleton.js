/**
 * TableSkeleton — hiển thị placeholder "xương cá" trong lúc bảng dữ liệu đang tải,
 * thay cho chữ "Đang tải..." tĩnh. Dùng: <TableSkeleton rows={5} cols={7} />
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <table className="table">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c}>
                <div className="skeleton-bar" style={{ width: `${60 + ((r + c) % 4) * 10}%` }} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Vài ô skeleton dùng cho card thống kê / dashboard */
export function CardSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '20px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="card" key={i}>
          <div className="skeleton-bar" style={{ width: '40%', height: '28px', marginBottom: '10px' }} />
          <div className="skeleton-bar" style={{ width: '70%', height: '14px' }} />
        </div>
      ))}
    </div>
  );
}
