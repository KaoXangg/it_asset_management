const db = require('../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const cache = require('../utils/cache');
const { checkAndNotify } = require('../jobs/notifyJob');

// Chạy thử job nhắc nhở (bảo hành/bảo trì) ngay lập tức thay vì chờ tới 8h sáng hôm sau —
// dùng để admin kiểm tra cấu hình SMTP có hoạt động không.
exports.sendTestNotification = async (req, res) => {
  try {
    const result = await checkAndNotify();
    res.json({
      message: result.mailResult.sent
        ? 'Đã gửi email nhắc nhở'
        : `Không gửi email: ${result.mailResult.reason}`,
      expiringWarrantyCount: result.expiringWarranty.length,
      dueMaintenanceCount: result.dueMaintenance.length,
      mailResult: result.mailResult,
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const { user_id, action, start_date, end_date } = req.query;
    // T-SQL: TOP phải đứng ngay sau SELECT, không dùng LIMIT như MySQL
    let query = `
      SELECT TOP 1000 al.*, u.full_name as user_name, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND al.user_id = ?';
      params.push(user_id);
    }
    if (action) {
      query += ' AND al.action = ?';
      params.push(action);
    }
    if (start_date) {
      // MySQL DATE(x) -> T-SQL CAST(x AS DATE)
      query += ' AND CAST(al.created_at AS DATE) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND CAST(al.created_at AS DATE) <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY al.created_at DESC';

    const [logs] = await db.query(query, params);
    res.json(logs);
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export assets to Excel
exports.exportAssetsToExcel = async (req, res) => {
  try {
    const [assets] = await db.query(`
      SELECT
        a.asset_code, a.name, a.type, a.brand, a.model, a.serial_number,
        a.purchase_date, a.warranty_expiry, a.status, a.condition_status,
        a.purchase_price, a.current_value, a.location,
        c.name as category_name
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      ORDER BY a.created_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assets');

    // Define columns
    worksheet.columns = [
      { header: 'Mã tài sản', key: 'asset_code', width: 15 },
      { header: 'Tên tài sản', key: 'name', width: 30 },
      { header: 'Loại', key: 'type', width: 15 },
      { header: 'Danh mục', key: 'category_name', width: 20 },
      { header: 'Thương hiệu', key: 'brand', width: 15 },
      { header: 'Model', key: 'model', width: 15 },
      { header: 'Serial Number', key: 'serial_number', width: 20 },
      { header: 'Ngày mua', key: 'purchase_date', width: 15 },
      { header: 'Hết bảo hành', key: 'warranty_expiry', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Tình trạng', key: 'condition_status', width: 15 },
      { header: 'Giá mua', key: 'purchase_price', width: 15 },
      { header: 'Giá hiện tại', key: 'current_value', width: 15 },
      { header: 'Vị trí', key: 'location', width: 20 }
    ];

    // Add rows
    assets.forEach(asset => {
      worksheet.addRow(asset);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=assets-report.xlsx');

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export assignments to Excel
exports.exportAssignmentsToExcel = async (req, res) => {
  try {
    const [assignments] = await db.query(`
      SELECT a.asset_code, a.name as asset_name, u.full_name as user_name,
             aa.assigned_date, aa.return_date, aa.status, ab.full_name as assigned_by_name, aa.notes
      FROM asset_assignments aa
      JOIN assets a ON aa.asset_id = a.id
      JOIN users u ON aa.user_id = u.id
      LEFT JOIN users ab ON aa.assigned_by = ab.id
      ORDER BY aa.assigned_date DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assignments');

    worksheet.columns = [
      { header: 'Mã tài sản', key: 'asset_code', width: 15 },
      { header: 'Tên tài sản', key: 'asset_name', width: 30 },
      { header: 'Người dùng', key: 'user_name', width: 20 },
      { header: 'Ngày phân bổ', key: 'assigned_date', width: 15 },
      { header: 'Ngày trả', key: 'return_date', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Người phân bổ', key: 'assigned_by_name', width: 20 },
      { header: 'Ghi chú', key: 'notes', width: 30 },
    ];

    assignments.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=assignments-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export maintenance records to Excel
exports.exportMaintenanceToExcel = async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT a.asset_code, a.name as asset_name, m.maintenance_type, m.description,
             m.maintenance_date, m.cost, m.performed_by, m.status, m.notes
      FROM maintenance_records m
      JOIN assets a ON m.asset_id = a.id
      ORDER BY m.maintenance_date DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Maintenance');

    worksheet.columns = [
      { header: 'Mã tài sản', key: 'asset_code', width: 15 },
      { header: 'Tên tài sản', key: 'asset_name', width: 30 },
      { header: 'Loại bảo trì', key: 'maintenance_type', width: 15 },
      { header: 'Mô tả', key: 'description', width: 30 },
      { header: 'Ngày', key: 'maintenance_date', width: 15 },
      { header: 'Chi phí', key: 'cost', width: 15 },
      { header: 'Người thực hiện', key: 'performed_by', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ghi chú', key: 'notes', width: 30 },
    ];

    records.forEach((row) => worksheet.addRow(row));
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=maintenance-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export dashboard summary as PDF — báo cáo gọn để gửi sếp, không cần mở Excel
exports.exportDashboardPDF = async (req, res) => {
  try {
    const [totalAssets] = await db.query('SELECT COUNT(*) as count FROM assets');
    const [byStatus] = await db.query('SELECT status, COUNT(*) as count FROM assets GROUP BY status');
    const [byType] = await db.query('SELECT type, COUNT(*) as count FROM assets GROUP BY type');
    const [totalValue] = await db.query('SELECT SUM(current_value) as total FROM assets');
    const [activeAssignments] = await db.query("SELECT COUNT(*) as count FROM asset_assignments WHERE status = 'active'");
    const [pendingMaintenance] = await db.query("SELECT COUNT(*) as count FROM maintenance_records WHERE status IN ('pending', 'in_progress')");

    const statusLabels = { available: 'Sẵn sàng', in_use: 'Đang dùng', maintenance: 'Đang bảo trì', broken: 'Hỏng', disposed: 'Đã thanh lý' };
    const typeLabels = { laptop: 'Laptop', desktop: 'Máy bàn', monitor: 'Màn hình', printer: 'Máy in', phone: 'Điện thoại', tablet: 'Máy tính bảng', other: 'Khác' };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=dashboard-report.pdf');

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text('Báo cáo tổng quan quản lý tài sản IT', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#666').text(`Xuất lúc: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fillColor('#000').fontSize(13).text('Tổng quan');
    doc.moveDown(0.3);
    doc.fontSize(11);
    doc.text(`Tổng số tài sản: ${totalAssets[0].count}`);
    doc.text(`Tổng giá trị hiện tại: ${Number(totalValue[0].total || 0).toLocaleString('vi-VN')} VNĐ`);
    doc.text(`Đang được phân bổ: ${activeAssignments[0].count}`);
    doc.text(`Đang chờ/đang bảo trì: ${pendingMaintenance[0].count}`);
    doc.moveDown(1);

    doc.fontSize(13).text('Theo trạng thái');
    doc.moveDown(0.3);
    doc.fontSize(11);
    byStatus.forEach((row) => doc.text(`${statusLabels[row.status] || row.status}: ${row.count}`));
    doc.moveDown(1);

    doc.fontSize(13).text('Theo loại thiết bị');
    doc.moveDown(0.3);
    doc.fontSize(11);
    byType.forEach((row) => doc.text(`${typeLabels[row.type] || row.type}: ${row.count}`));

    doc.end();
  } catch (error) {
    console.error('Export dashboard PDF error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get dashboard statistics — cache 60s để tránh query lại toàn bộ mỗi lần ai đó mở
// dashboard (nhiều query GROUP BY trên bảng assets/assignments/maintenance).
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await cache.wrap('dashboard-stats', 60 * 1000, async () => {
      const [totalAssets] = await db.query('SELECT COUNT(*) as count FROM assets');
      const [byStatus] = await db.query('SELECT status, COUNT(*) as count FROM assets GROUP BY status');
      const [byType] = await db.query('SELECT type, COUNT(*) as count FROM assets GROUP BY type');
      const [totalValue] = await db.query('SELECT SUM(current_value) as total FROM assets');
      const [activeAssignments] = await db.query("SELECT COUNT(*) as count FROM asset_assignments WHERE status = 'active'");
      const [pendingMaintenance] = await db.query("SELECT COUNT(*) as count FROM maintenance_records WHERE status IN ('pending', 'in_progress')");
      const [recentActivities] = await db.query(`
        SELECT TOP 10 al.*, u.full_name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
      `);
      const [expiringWarranty] = await db.query(`
        SELECT COUNT(*) as count
        FROM assets
        WHERE warranty_expiry BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(DAY, 30, CAST(GETDATE() AS DATE))
      `);

      return {
        totalAssets: totalAssets[0].count,
        byStatus,
        byType,
        totalValue: totalValue[0].total || 0,
        activeAssignments: activeAssignments[0].count,
        pendingMaintenance: pendingMaintenance[0].count,
        expiringWarranty: expiringWarranty[0].count,
        recentActivities,
      };
    });

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get assets due for maintenance
exports.getDueMaintenanceAssets = async (req, res) => {
  try {
    // Get assets whose last completed maintenance was over 6 months ago, or never had maintenance
    // Lưu ý: T-SQL bắt buộc mọi cột không được aggregate phải nằm trong GROUP BY (khác MySQL).
    // DATEDIFF của MySQL: DATEDIFF(date1, date2) = date1 - date2 (tính bằng ngày)
    // DATEDIFF của T-SQL:  DATEDIFF(datepart, startdate, enddate) -> phải đổi thứ tự tham số
    const [assets] = await db.query(`
      SELECT TOP 10
        a.id, a.asset_code, a.name, a.type, MAX(mr.maintenance_date) as last_maintenance_date
      FROM assets a
      LEFT JOIN maintenance_records mr ON a.id = mr.asset_id AND mr.status = 'completed'
      WHERE a.status NOT IN ('broken', 'disposed')
      GROUP BY a.id, a.asset_code, a.name, a.type
      HAVING MAX(mr.maintenance_date) IS NULL OR DATEDIFF(DAY, MAX(mr.maintenance_date), GETDATE()) > 180
      ORDER BY last_maintenance_date ASC
    `);

    res.json(assets);
  } catch (error) {
    console.error('Get due maintenance assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get maintenance cost report
exports.getMaintenanceCostReport = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    // MySQL DATE_FORMAT(x, '%Y-%m') -> T-SQL FORMAT(x, 'yyyy-MM')
    // T-SQL không cho GROUP BY / ORDER BY theo alias -> phải lặp lại biểu thức
    const [costs] = await db.query(`
      SELECT
        FORMAT(maintenance_date, 'yyyy-MM') as month,
        SUM(cost) as total_cost,
        COUNT(*) as total_records
      FROM maintenance_records
      WHERE YEAR(maintenance_date) = ? AND status = 'completed'
      GROUP BY FORMAT(maintenance_date, 'yyyy-MM')
      ORDER BY FORMAT(maintenance_date, 'yyyy-MM') ASC
    `, [targetYear]);

    res.json(costs);
  } catch (error) {
    console.error('Get maintenance cost report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
