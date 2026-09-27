const bcrypt = require('bcryptjs');

jest.mock('../config/database', () => require('./__mocks__/database'));

const db = require('../config/database');
const createApp = require('../app');
const request = require('supertest');

const app = createApp();

describe('POST /api/auth/login', () => {
  beforeEach(() => db.__reset());

  it('trả về 400 khi thiếu username/password', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('trả về 401 khi username không tồn tại', async () => {
    db.__setQueryImpl(async () => [[]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'khong_ton_tai', password: '123456' });

    expect(res.status).toBe(401);
  });

  it('trả về 401 khi sai mật khẩu', async () => {
    const hashed = await bcrypt.hash('correct-password', 10);
    db.__setQueryImpl(async () => [[{ id: 1, username: 'admin', password: hashed, role: 'admin', is_active: 1 }]]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong-password' });

    expect(res.status).toBe(401);
  });

  it('đăng nhập thành công trả về access token + thông tin user, không lộ password', async () => {
    const hashed = await bcrypt.hash('correct-password', 10);
    db.__setQueryImpl(async (query) => {
      if (query.startsWith('SELECT * FROM users')) {
        return [[{ id: 1, username: 'admin', password: hashed, role: 'admin', full_name: 'Admin', email: 'a@a.com', is_active: 1 }]];
      }
      return [[]];
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'correct-password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('admin');
    expect(res.body.user.password).toBeUndefined();
    // Refresh token phải nằm trong httpOnly cookie, không trả trong JSON body
    expect(res.headers['set-cookie']?.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });
});

describe('Xác thực & phân quyền route được bảo vệ', () => {
  it('GET /api/assets không có token trả về 401', async () => {
    const res = await request(app).get('/api/assets');
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/register không có token trả về 401 (chỉ admin đã đăng nhập mới tạo được user)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', password: '123456', full_name: 'New User', role: 'regular_user' });
    expect(res.status).toBe(401);
  });
});
