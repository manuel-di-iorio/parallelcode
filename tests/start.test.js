const start = require('../lib/start');
const free = require('../lib/free');
const { pool } = require('../lib/ctx');

beforeEach(start);
afterEach(free);

test('there should be at least one worker', () => {
  expect(pool.size).not.toBe(0);
});

test('should throw an error if starting twice the worker pool', async () => {
  await expect(start()).rejects.toThrow();
});
