const { pool } = require('./ctx');

/**
 * Terminate a specific worker, setting its state as killed
 *
 * @param {String} workerId
 *
 * @return {Promise}
 */
const kill = async (workerId) => {
  const poolWorker = pool.get(workerId);
  poolWorker.jobs.clear();

  // Only kill the thread if not killed yet
  if (poolWorker.worker) {
    await poolWorker.worker.terminate();
    poolWorker.worker.removeAllListeners();
    poolWorker.worker = null;
  }
};

module.exports = kill;
