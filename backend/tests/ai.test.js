const { app, request, createUserAndLogin } = require('./helpers');

describe('AI Assistant endpoint', () => {
  it('rejects an empty message', async () => {
    const { token } = await createUserAndLogin({ email: 'ai1@example.com', role: 'staff' });
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: '' });
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/ai/chat').send({ message: 'Hello' });
    expect(res.status).toBe(401);
  });

  it('returns a clear error when ANTHROPIC_API_KEY is not configured', async () => {
    const { token } = await createUserAndLogin({ email: 'ai2@example.com', role: 'staff' });
    const res = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'How many bearings are in stock?' });

    // In the test environment ANTHROPIC_API_KEY is intentionally unset.
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/not configured/i);
  });
});
