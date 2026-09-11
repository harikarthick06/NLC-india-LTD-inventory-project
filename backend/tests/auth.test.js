const { app, request } = require('./helpers');

describe('Auth', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Doe', email: 'jane@example.com', password: 'Password1' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('jane@example.com');
    expect(res.body.data.user.role).toBe('staff');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects duplicate registration email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Doe', email: 'dup@example.com', password: 'Password1' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jane Two', email: 'dup@example.com', password: 'Password1' });

    expect(res.status).toBe(409);
  });

  it('rejects registration with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak Pw', email: 'weak@example.com', password: 'abc' });
    expect(res.status).toBe(400);
  });

  it('does not allow self-registering as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Wannabe Admin', email: 'admin-wannabe@example.com', password: 'Password1', role: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('staff');
  });

  it('logs in with correct credentials and rejects wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@example.com', password: 'Password1' });

    const good = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password1' });
    expect(good.status).toBe(200);
    expect(good.body.data.token).toBeDefined();

    const bad = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass1' });
    expect(bad.status).toBe(401);
  });

  it('returns the current user for GET /api/auth/me with a valid token', async () => {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Me User', email: 'me@example.com', password: 'Password1' });
    const token = register.body.data.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('me@example.com');
  });

  it('rejects protected routes without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
