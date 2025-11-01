import promBundle from 'express-prom-bundle';
import { register } from 'prom-client';

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: 'load-tester-api' },
  promClient: {
    collectDefaultMetrics: {
    },
  },
});

export { metricsMiddleware, register };
