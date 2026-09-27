// Mock cho config/database — test không cần SQL Server thật.
// Mỗi test tự set `__setQueryImpl(fn)` để giả lập dữ liệu trả về theo câu query.
let queryImpl = async () => [[]];

function query(...args) {
  return queryImpl(...args);
}

function __setQueryImpl(fn) {
  queryImpl = fn;
}

function __reset() {
  queryImpl = async () => [[]];
}

module.exports = { query, __setQueryImpl, __reset, sql: {}, poolPromise: Promise.resolve({}) };
