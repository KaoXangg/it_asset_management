const db = require('../config/database');
const cache = require('../utils/cache');

// Get all assignments (có phân trang; truyền all=true để lấy toàn bộ — dùng cho export)
exports.getAllAssignments = async (req, res) => {
  try {
    const { status, user_id } = req.query;
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND aa.status = ?';
      params.push(status);
    }
    if (user_id) {
      whereClause += ' AND aa.user_id = ?';
      params.push(user_id);
    }

    const baseSelect = `
      SELECT aa.*, 
             a.name as asset_name, a.asset_code, a.type as asset_type,
             u.full_name as user_name, u.username,
             ab.full_name as assigned_by_name
      FROM asset_assignments aa
      JOIN assets a ON aa.asset_id = a.id
      JOIN users u ON aa.user_id = u.id
      LEFT JOIN users ab ON aa.assigned_by = ab.id
      ${whereClause}
      ORDER BY aa.assigned_date DESC
    `;

    if (req.query.all === 'true') {
      const [assignments] = await db.query(baseSelect, params);
      return res.json(assignments);
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const offset = (page - 1) * limit;

    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM asset_assignments aa${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    const [assignments] = await db.query(
      `${baseSelect} OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [...params, offset, limit]
    );

    res.json({
      data: assignments,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { asset_id, user_id, assigned_date, notes } = req.body;

    if (!asset_id || !user_id || !assigned_date) {
      return res.status(400).json({ error: 'Asset, user, and date are required' });
    }

    // Check if asset is available
    const [assets] = await db.query('SELECT status FROM assets WHERE id = ?', [asset_id]);
    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    if (assets[0].status !== 'available') {
      return res.status(400).json({ error: 'Asset is not available for assignment' });
    }

    // Create assignment
    const [result] = await db.query(
      'INSERT INTO asset_assignments (asset_id, user_id, assigned_date, notes, assigned_by, status) VALUES (?, ?, ?, ?, ?, ?)',
      [asset_id, user_id, assigned_date, notes, req.user.id, 'active']
    );

    // Update asset status
    await db.query('UPDATE assets SET status = ? WHERE id = ?', ['in_use', asset_id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'assign', 'asset', asset_id, `Assigned asset to user ID: ${user_id}`]
    );

    cache.invalidate('dashboard-stats');
    res.status(201).json({ message: 'Assignment created successfully', assignmentId: result.insertId });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Return asset
exports.returnAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_date, notes } = req.body;

    if (!return_date) {
      return res.status(400).json({ error: 'Return date is required' });
    }

    // Get assignment details
    const [assignments] = await db.query('SELECT asset_id FROM asset_assignments WHERE id = ?', [id]);
    if (assignments.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Update assignment (CONCAT/COALESCE dùng dấu nháy đơn '' theo chuẩn T-SQL thay vì "" của MySQL)
    await db.query(
      "UPDATE asset_assignments SET return_date = ?, status = ?, notes = CONCAT(COALESCE(notes, ''), ?, ?) WHERE id = ?",
      [return_date, 'returned', notes ? '\n' : '', notes || '', id]
    );

    // Update asset status to available
    await db.query('UPDATE assets SET status = ? WHERE id = ?', ['available', assignments[0].asset_id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'return', 'asset', assignments[0].asset_id, `Asset returned from assignment ID: ${id}`]
    );

    cache.invalidate('dashboard-stats');
    res.json({ message: 'Asset returned successfully' });
  } catch (error) {
    console.error('Return asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's assignments
exports.getMyAssignments = async (req, res) => {
  try {
    const [assignments] = await db.query(
      `SELECT aa.*, 
              a.name as asset_name, a.asset_code, a.type as asset_type,
              a.brand, a.model, a.serial_number
       FROM asset_assignments aa
       JOIN assets a ON aa.asset_id = a.id
       WHERE aa.user_id = ?
       ORDER BY aa.assigned_date DESC`,
      [req.user.id]
    );

    res.json(assignments);
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
