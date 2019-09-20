const ctx = require('./ctx');
const kill = require('./kill');

const { pool } = ctx;

/**
 * Terminate all workers and stop the threadpool
 * @return {Promise}
 */
const free = async () => {
  clearInterval(ctx.tickInterval);

  const promises = [];
  promises.push(ctx.queueHandler.clear());

  for (const [workerId] of pool) {
    promises.push(kill(workerId));
  }

  await Promise.all(promises);
  pool.clear();
};

module.exports = free;
