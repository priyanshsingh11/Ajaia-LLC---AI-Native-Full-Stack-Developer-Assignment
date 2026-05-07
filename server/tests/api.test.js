const request = require('supertest');
const app = require('../index');

describe('API Endpoints', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('should return 401 for unauthorized access to documents', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.statusCode).toEqual(401);
  });
});
