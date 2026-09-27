import { useEffect, useState } from 'react';

/**
 * useDebouncedValue — trả về giá trị chỉ cập nhật sau khi người dùng ngừng gõ `delay` ms.
 * Dùng cho ô tìm kiếm để tránh gọi API liên tục theo từng ký tự gõ.
 *
 *   const [search, setSearch] = useState('');
 *   const debouncedSearch = useDebouncedValue(search, 400);
 *   useEffect(() => { fetchData(debouncedSearch); }, [debouncedSearch]);
 */
export default function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
