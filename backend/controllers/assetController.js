const db = require('../config/database');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const cache = require('../utils/cache');

// Get all assets with filters (+ phân trang)
exports.getAllAssets = async (req, res) => {
  try {
    const { status, type, category, search } = req.query;

    let whereClause = ' WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }
    if (type) {
      whereClause += ' AND a.type = ?';
      params.push(type);
    }
    if (category) {
      whereClause += ' AND a.category_id = ?';
      params.push(category);
    }
    if (search) {
      whereClause += ' AND (a.name LIKE ? OR a.asset_code LIKE ? OR a.serial_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const baseSelect = `
      SELECT a.*, c.name as category_name,
             u.full_name as assigned_to_name,
             aa.assigned_date
      FROM assets a
      LEFT JOIN asset_categories c ON a.category_id = c.id
      LEFT JOIN asset_assignments aa ON a.id = aa.asset_id AND aa.status = 'active'
      LEFT JOIN users u ON aa.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    // `all=true` — dùng cho các dropdown chọn tài sản (phân bổ, bảo trì...), trả về
    // mảng phẳng như API cũ, KHÔNG phân trang. Mặc định (không có `all`) sẽ phân trang.
    if (req.query.all === 'true') {
      const [assets] = await db.query(baseSelect, params);
      return res.json(assets);
    }

    // Phân trang: mặc định 20 dòng/trang, tối đa 100 để tránh query quá nặng
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM assets a${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    const [assets] = await db.query(
      `${baseSelect} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [...params, offset, limit]
    );

    res.json({
      data: assets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single asset by asset_code (dùng cho tính năng quét QR)
exports.getAssetByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const [assets] = await db.query(
      `SELECT a.id, a.asset_code, a.name, a.type, a.status
       FROM assets a
       WHERE a.asset_code = ?`,
      [code]
    );

    if (assets.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài sản với mã này' });
    }

    res.json(assets[0]);
  } catch (error) {
    console.error('Get asset by code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single asset
exports.getAssetById = async (req, res) => {
  try {
    const [assets] = await db.query(
      `SELECT a.*, c.name as category_name
       FROM assets a
       LEFT JOIN asset_categories c ON a.category_id = c.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = assets[0];

    // Backfill: tài sản cũ (import từ dữ liệu mẫu, hoặc tạo trước khi có tính năng QR)
    // có thể chưa có qr_code. Tự tạo và lưu lại ngay lần xem đầu tiên, không cần chạy
    // migration riêng.
    if (!asset.qr_code) {
      try {
        const qrCodeData = await QRCode.toDataURL(asset.asset_code);
        await db.query('UPDATE assets SET qr_code = ? WHERE id = ?', [qrCodeData, asset.id]);
        asset.qr_code = qrCodeData;
      } catch (qrError) {
        console.error('Backfill QR code error:', qrError);
        // Không chặn việc xem chi tiết tài sản nếu tạo QR lỗi
      }
    }

    // Get assignment history
    const [assignments] = await db.query(
      `SELECT aa.*, u.full_name as user_name, ab.full_name as assigned_by_name
       FROM asset_assignments aa
       LEFT JOIN users u ON aa.user_id = u.id
       LEFT JOIN users ab ON aa.assigned_by = ab.id
       WHERE aa.asset_id = ?
       ORDER BY aa.assigned_date DESC`,
      [req.params.id]
    );

    // Get maintenance history
    const [maintenance] = await db.query(
      'SELECT * FROM maintenance_records WHERE asset_id = ? ORDER BY maintenance_date DESC',
      [req.params.id]
    );

    res.json({
      ...assets[0],
      assignments,
      maintenance
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// (Re)generate QR code cho một tài sản cụ thể — dùng khi cần làm mới thủ công
exports.regenerateQrCode = async (req, res) => {
  try {
    const { id } = req.params;

    const [assets] = await db.query('SELECT id, asset_code FROM assets WHERE id = ?', [id]);
    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const qrCodeData = await QRCode.toDataURL(assets[0].asset_code);
    await db.query('UPDATE assets SET qr_code = ? WHERE id = ?', [qrCodeData, id]);

    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update', 'asset', id, `Regenerated QR code for asset ID: ${id}`]
    );

    res.json({ qr_code: qrCodeData });
  } catch (error) {
    console.error('Regenerate QR code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload/thay ảnh cho tài sản. File thực tế đã được multer lưu vào backend/uploads/assets
// trước khi vào tới đây (xem middleware/upload.js) — chỉ cần lưu lại đường dẫn public.
exports.uploadImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn file ảnh' });
    }

    const [assets] = await db.query('SELECT id, image_url FROM assets WHERE id = ?', [id]);
    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const imageUrl = `/uploads/assets/${req.file.filename}`;
    await db.query('UPDATE assets SET image_url = ? WHERE id = ?', [imageUrl, id]);

    // Xóa ảnh cũ trên đĩa nếu có, tránh rác tích lũy theo thời gian
    const oldUrl = assets[0].image_url;
    if (oldUrl && oldUrl.startsWith('/uploads/assets/')) {
      const oldPath = path.join(__dirname, '..', oldUrl);
      fs.unlink(oldPath, () => {});
    }

    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update', 'asset', id, `Uploaded image for asset ID: ${id}`]
    );

    res.json({ image_url: imageUrl });
  } catch (error) {
    console.error('Upload asset image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create asset
exports.createAsset = async (req, res) => {
  try {
    const {
      asset_code, name, category_id, type, brand, model, serial_number,
      purchase_date, warranty_expiry, status, condition_status,
      purchase_price, current_value, location, notes
    } = req.body;

    if (!asset_code || !name || !type) {
      return res.status(400).json({ error: 'Asset code, name, and type are required' });
    }

    // Generate QR code
    const qrCodeData = await QRCode.toDataURL(asset_code);

    const [result] = await db.query(
      `INSERT INTO assets (
        asset_code, name, category_id, type, brand, model, serial_number,
        purchase_date, warranty_expiry, status, condition_status,
        purchase_price, current_value, location, notes, qr_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        asset_code, name, category_id, type, brand, model, serial_number,
        purchase_date, warranty_expiry, status || 'available', condition_status || 'good',
        purchase_price, current_value, location, notes, qrCodeData
      ]
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create', 'asset', result.insertId, `Created asset: ${name}`]
    );

    cache.invalidate('dashboard-stats');
    res.status(201).json({ message: 'Asset created successfully', assetId: result.insertId });
  } catch (error) {
    // SQL Server: 2627/2601 = vi phạm UNIQUE/PRIMARY KEY (tương đương ER_DUP_ENTRY của MySQL)
    if (error.number === 2627 || error.number === 2601) {
      return res.status(400).json({ error: 'Asset code already exists' });
    }
    console.error('Create asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update asset
exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const allowedFields = [
      'name', 'category_id', 'type', 'brand', 'model', 'serial_number',
      'purchase_date', 'warranty_expiry', 'status', 'condition_status',
      'purchase_price', 'current_value', 'location', 'notes'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateFields).forEach(field => {
      if (allowedFields.includes(field)) {
        updates.push(`${field} = ?`);
        values.push(updateFields[field]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    await db.query(`UPDATE assets SET ${updates.join(', ')} WHERE id = ?`, values);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update', 'asset', id, `Updated asset ID: ${id}`]
    );

    res.json({ message: 'Asset updated successfully' });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete asset
exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM assets WHERE id = ?', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'delete', 'asset', id, `Deleted asset ID: ${id}`]
    );

    cache.invalidate('dashboard-stats');
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Delete asset error:', error);
    // SQL Server: 547 = vi phạm ràng buộc khóa ngoại (tương đương ER_ROW_IS_REFERENCED_2 của MySQL)
    if (error.number === 547) {
      return res.status(400).json({ error: 'Cannot delete asset with existing assignments or maintenance records' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get asset statistics
exports.getAssetStats = async (req, res) => {
  try {
    const [totalAssets] = await db.query('SELECT COUNT(*) as count FROM assets');
    const [byStatus] = await db.query('SELECT status, COUNT(*) as count FROM assets GROUP BY status');
    const [byType] = await db.query('SELECT type, COUNT(*) as count FROM assets GROUP BY type');
    const [totalValue] = await db.query('SELECT SUM(current_value) as total FROM assets');

    res.json({
      total: totalAssets[0].count,
      byStatus,
      byType,
      totalValue: totalValue[0].total || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
