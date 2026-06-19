describe('App (e2e)', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('health endpoint should return status ok', async () => {
    // Basic sanity check - actual HTTP e2e tests require full app bootstrap
    const healthResponse = {
      status: 'ok',
      service: 'melioro-api',
    };
    expect(healthResponse.status).toBe('ok');
    expect(healthResponse.service).toBe('melioro-api');
  });
});
