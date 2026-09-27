const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = '7d';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Dùng secret riêng cho refresh token nếu có, để lỡ lộ 1 trong 2 secret cũng không
// phá được cả access lẫn refresh. Nếu không cấu hình thì fallback về JWT_SECRET
// (vẫn hoạt động, chỉ kém an toàn hơn 1 chút — nên set REFRESH_TOKEN_SECRET trong .env).
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id, tokenType: 'refresh' }, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/api/auth', // chỉ gửi cookie này cho các route auth (login/refresh/logout)
  });
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const user = users[0];

    if (user.is_active === false || user.is_active === 0) {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    setRefreshCookie(res, refreshToken);

    await db.query(
      'INSERT INTO activity_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
      [user.id, 'login', 'User logged in', req.ip]
    );

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cấp access token mới từ refresh token (đọc từ httpOnly cookie) — frontend gọi
// endpoint này khi access token hết hạn (30 phút) thay vì bắt người dùng đăng nhập lại.
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'Không có refresh token' });
    }

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_SECRET);
    } catch {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(403).json({ error: 'Refresh token không hợp lệ hoặc đã hết hạn' });
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [payload.id]);
    if (users.length === 0) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }
    const user = users[0];
    if (user.is_active === false || user.is_active === 0) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
    }

    const accessToken = signAccessToken(user);
    // Xoay vòng refresh token (rotate) — hạn chế rủi ro nếu cookie cũ bị lộ
    const newRefreshToken = signRefreshToken(user);
    setRefreshCookie(res, newRefreshToken);

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json({ message: 'Logged out' });
};

exports.register = async (req, res) => {
  try {
    const { username, password, full_name, email, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name, email, role]
    );

    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id ?? null, 'create', 'user', result.insertId, `Created user: ${username}`]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    // SQL Server: 2627/2601 = vi phạm UNIQUE (tương đương ER_DUP_ENTRY của MySQL)
    if (error.number === 2627 || error.number === 2601) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, username, full_name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
