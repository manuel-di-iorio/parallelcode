const start = require('../lib/start');
const free = require('../lib/free');
const job = require('../lib/job');
const { pool } = require('../lib/ctx');

beforeEach(start);
afterEach(free);

test('should free the worker pool, killing the active worker', async () => {
  await job(() => (new Promise(resolve => setTimeout(resolve, 99999))));
  await free();
  expect(pool.size).toBe(0);
});
