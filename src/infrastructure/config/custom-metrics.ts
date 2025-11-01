import { Counter } from 'prom-client';

export const loadTestCounter = new Counter({
  name: 'load_tests_total',
  help: 'Total number of load tests started',
  labelNames: ['status'],
});

export const getLoadTestResultsCounter = new Counter({
  name: 'get_load_test_results_total',
  help: 'Total number of get load test results requests',
  labelNames: ['status'],
});

export const getAllLoadTestsCounter = new Counter({
  name: 'get_all_load_tests_total',
  help: 'Total number of get all load tests requests',
  labelNames: ['status'],
});

export const getTestsByDateCounter = new Counter({
  name: 'get_tests_by_date_total',
  help: 'Total number of get tests by date requests',
  labelNames: ['status'],
});
