const start = require('../lib/start');
const free = require('../lib/free');
const job = require('../lib/job');
const kill = require('../lib/kill');
const { pool } = require('../lib/ctx');

beforeEach(start);
afterEach(free);

test('should kill the specific worker', async () => {
  const poolWorker = await job(() => (new Promise(resolve => setTimeout(resolve, 99999))));
  await kill(poolWorker.id);
  const killedWorker = pool.get(poolWorker.id);
  expect(killedWorker.jobs.size).toBe(0);
  expect(killedWorker.worker).toBe(null);
});
