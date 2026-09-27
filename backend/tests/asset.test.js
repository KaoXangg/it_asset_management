const jwt = require('jsonwebtoken');

jest.mock('../config/database', () => require('./__mocks__/database'));

const db = require('../config/database');
const createApp = require('../app');
const request = require('supertest');

const app = createApp();

function tokenFor(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
}

describe('POST /api/assets (validation)', () => {
  beforeEach(() => db.__reset());

  const adminToken = tokenFor({ id: 1, username: 'admin', role: 'admin' });

  it('từ chối khi thiếu asset_code/name/type', async () => {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('từ chối khi type không nằm trong danh sách cho phép', async () => {
    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ asset_code: 'X001', name: 'Test asset', type: 'khong_hop_le' });

    expect(res.status).toBe(400);
  });

  it('regular_user bị từ chối tạo tài sản (403)', async () => {
    const userToken = tokenFor({ id: 2, username: 'user', role: 'regular_user' });

    const res = await request(app)
      .post('/api/assets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ asset_code: 'X001', name: 'Test asset', type: 'laptop' });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/assets (phân trang)', () => {
  beforeEach(() => db.__reset());
  const adminToken = tokenFor({ id: 1, username: 'admin', role: 'admin' });

  it('trả về đúng cấu trúc { data, pagination }', async () => {
    db.__setQueryImpl(async (query) => {
      if (query.includes('COUNT(*)')) return [[{ total: 2 }]];
      return [[{ id: 1, name: 'Asset A' }, { id: 2, name: 'Asset B' }]];
    });

    const res = await request(app)
      .get('/api/assets')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });
});
