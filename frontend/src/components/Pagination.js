import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

/**
 * Pagination — thanh điều hướng trang, dùng chung cho các bảng danh sách.
 *   <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
 */
export default function Pagination({ page, totalPages, total, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  // Hiển thị tối đa 5 số trang xung quanh trang hiện tại
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="pagination">
      <span className="pagination-info">
        {total != null ? `${total} kết quả — ` : ''}Trang {page}/{totalPages}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
        >
          <HiOutlineChevronLeft />
        </button>
        {start > 1 && <span className="pagination-ellipsis">…</span>}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`btn btn-sm${p === page ? ' btn-primary' : ''}`}
            onClick={() => goTo(p)}
          >
            {p}
          </button>
        ))}
        {end < totalPages && <span className="pagination-ellipsis">…</span>}
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
        >
          <HiOutlineChevronRight />
        </button>
      </div>
    </div>
  );
}
