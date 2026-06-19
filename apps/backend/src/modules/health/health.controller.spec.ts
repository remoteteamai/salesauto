import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return health status', () => {
    const result = controller.health();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('service', 'melioro-api');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('version');
  });
});
