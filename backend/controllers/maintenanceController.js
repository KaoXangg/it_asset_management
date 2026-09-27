const db = require('../config/database');
const cache = require('../utils/cache');

// Get all maintenance records (có phân trang; truyền all=true để lấy toàn bộ)
exports.getAllMaintenance = async (req, res) => {
  try {
    const { asset_id, status } = req.query;
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (asset_id) {
      whereClause += ' AND m.asset_id = ?';
      params.push(asset_id);
    }
    if (status) {
      whereClause += ' AND m.status = ?';
      params.push(status);
    }

    const baseSelect = `
      SELECT m.*, a.name as asset_name, a.asset_code
      FROM maintenance_records m
      JOIN assets a ON m.asset_id = a.id
      ${whereClause}
      ORDER BY m.maintenance_date DESC
    `;

    if (req.query.all === 'true') {
      const [records] = await db.query(baseSelect, params);
      return res.json(records);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM maintenance_records m${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    const [records] = await db.query(
      `${baseSelect} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [...params, offset, limit]
    );

    res.json({
      data: records,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.error('Get maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single maintenance record
exports.getMaintenanceById = async (req, res) => {
  try {
    const [records] = await db.query(
      'SELECT * FROM maintenance_records WHERE id = ?',
      [req.params.id]
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json(records[0]);
  } catch (error) {
    console.error('Get maintenance record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Create maintenance record
exports.createMaintenance = async (req, res) => {
  try {
    const {
      asset_id, maintenance_type, description, cost,
      maintenance_date, performed_by, status, notes
    } = req.body;

    if (!asset_id || !maintenance_type || !description || !maintenance_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const [result] = await db.query(
      `INSERT INTO maintenance_records (
        asset_id, maintenance_type, description, cost,
        maintenance_date, performed_by, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_id, maintenance_type, description, cost, maintenance_date, performed_by, status || 'pending', notes]
    );

    // If maintenance is in progress, update asset status
    if (status === 'in_progress') {
      await db.query('UPDATE assets SET status = ? WHERE id = ?', ['maintenance', asset_id]);
    }

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create', 'maintenance', result.insertId, `Created maintenance record for asset ID: ${asset_id}`]
    );

    cache.invalidate('dashboard-stats');
    res.status(201).json({ message: 'Maintenance record created successfully', maintenanceId: result.insertId });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update maintenance record
exports.updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cost, notes, performed_by } = req.body;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (cost !== undefined) {
      updates.push('cost = ?');
      values.push(cost);
    }
    if (notes) {
      updates.push('notes = ?');
      values.push(notes);
    }
    if (performed_by) {
      updates.push('performed_by = ?');
      values.push(performed_by);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    await db.query(`UPDATE maintenance_records SET ${updates.join(', ')} WHERE id = ?`, values);

    // If maintenance is completed, update asset status back to available
    if (status === 'completed') {
      const [records] = await db.query('SELECT asset_id FROM maintenance_records WHERE id = ?', [id]);
      if (records.length > 0) {
        await db.query('UPDATE assets SET status = ? WHERE id = ?', ['available', records[0].asset_id]);
      }
    }

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update', 'maintenance', id, `Updated maintenance record ID: ${id}`]
    );

    cache.invalidate('dashboard-stats');
    res.json({ message: 'Maintenance record updated successfully' });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

