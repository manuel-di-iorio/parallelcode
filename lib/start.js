const { cpus } = require('os');
const ctx = require('./ctx');
const queueHandler = require('./queue');
const spawn = require('./spawn');
const tick = require('./tick');
const uuid = require('./uuid');

/**
 * Start the worker pool
 *
 * @param {Object} [options]
 * @param {Number} [options.workers] Number of workers to spawn
 * @param {Number} [options.concurrentJobs] Number of jobs that a worker can execute in parallel
 * @param {Object} [options.queue] Queue handler
 * @param {Function} [options.errorLogger] Called when an error is occured for logging purposes
 * @param {Object} [options.tickIntervalTime] Queue handler
 * @param {Function} [options.uuidMethod] UUID generator method
 *
 * @return {Promise}
 */
const start = async (options = {}) => {
  if (ctx.pool.size) throw new Error("Cannot start twice the worker pool");

  options = options || {};
  ctx.workersCount = options.workers || cpus().length;
  ctx.concurrentJobs = options.concurrentJobs || 10;
  ctx.queueHandler = options.queue || queueHandler;
  ctx.errorLogger = options.errorLogger || console.error;
  ctx.tickIntervalTime = options.tickIntervalTime || 100;
  ctx.uuid = options.uuidMethod || uuid;

  // Generate the initial workers
  let startedWorkers = 0;
  const promises = [...Array(ctx.workersCount)].map(() => (
    new Promise((resolve) => {
      spawn()
        .then(() => startedWorkers++)
        .catch(ctx.errorLogger)
        .finally(resolve);
    })
  ));
  await Promise.all(promises);
  if (!startedWorkers) throw new Error('No available workers to start the worker pool');

  ctx.tickInterval = setTimeout(tick, ctx.tickIntervalTime);
};

module.exports = start;
