const start = require('../lib/start');
const free = require('../lib/free');
const job = require('../lib/job');
const kill = require('../lib/kill');
const { pool } = require('../lib/ctx');

beforeEach(start);
afterEach(free);

test('should kill the specific worker', async () => {
  const { worker: poolWorker } = await job(() => (new Promise(resolve => setTimeout(resolve, 99999))));
  await kill(poolWorker.id);
  expect(poolWorker.jobs.size).toBe(0);
  expect(poolWorker.worker).toBe(null);
});
