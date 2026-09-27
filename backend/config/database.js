const sql = require('mssql');
require('dotenv').config();

/**
 * Cấu hình kết nối SQL Server.
 * DB_HOST hỗ trợ cả named instance kiểu "localhost\\SQLEXPRESS".
 * Yêu cầu SQL Server Authentication (Mixed Mode) đã bật trong SSMS.
 */
const config = {
  server: (process.env.DB_HOST || 'localhost').split('\\')[0],
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  database: process.env.DB_NAME || 'it_asset_management',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false, // true nếu dùng Azure SQL
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: process.env.DB_HOST && process.env.DB_HOST.includes('\\')
      ? process.env.DB_HOST.split('\\')[1]
      : undefined
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Nếu dùng named instance (vd: localhost\SQLEXPRESS) thì không set port cố định,
// SQL Server Browser sẽ tự resolve port qua instanceName.
if (config.options.instanceName) {
  delete config.port;
}

let poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Đã kết nối SQL Server thành công');
    return pool;
  })
  .catch(err => {
    console.error('❌ Kết nối SQL Server thất bại:', err.message);
    process.exit(1);
  });

/**
 * Wrapper giả lập API của mysql2 (db.query(sql, params)) để KHÔNG phải viết lại
 * toàn bộ cú pháp gọi ở controllers.
 *
 * - Placeholder '?' (kiểu MySQL) được tự động chuyển thành '@p0', '@p1', ... (kiểu mssql).
 * - Trả về mảng [rows] giống mysql2 để giữ nguyên cú pháp `const [rows] = await db.query(...)`.
 * - Với câu lệnh INSERT không có OUTPUT, tự động thêm
 *   "; SELECT SCOPE_IDENTITY() AS insertId" để lấy được result.insertId như mysql2.
 */
async function query(queryText, params = []) {
  const pool = await poolPromise;
  const request = pool.request();

  let paramIndex = 0;
  const convertedQuery = queryText.replace(/\?/g, () => `@p${paramIndex++}`);

  params.forEach((value, i) => {
    request.input(`p${i}`, value === undefined ? null : value);
  });

  const upperTrimmed = convertedQuery.trim().toUpperCase();
  const isInsert = upperTrimmed.startsWith('INSERT');
  const alreadyHasOutput = upperTrimmed.includes('OUTPUT ');

  const finalQuery = isInsert && !alreadyHasOutput
    ? `${convertedQuery};\nSELECT SCOPE_IDENTITY() AS insertId;`
    : convertedQuery;

  const result = await request.query(finalQuery);

  if (isInsert && !alreadyHasOutput) {
    // recordsets[recordsets.length - 1] chứa kết quả của SELECT SCOPE_IDENTITY()
    const idRecordset = result.recordsets[result.recordsets.length - 1];
    const rawId = idRecordset && idRecordset[0] ? idRecordset[0].insertId : null;
    return [{
      insertId: rawId !== null ? parseInt(rawId, 10) : null,
      affectedRows: result.rowsAffected[0]
    }];
  }

  return [result.recordset || [], result];
}

module.exports = { query, sql, poolPromise };
