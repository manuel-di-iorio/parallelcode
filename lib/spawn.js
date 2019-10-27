const { Worker } = require('worker_threads');
const ctx = require('./ctx');
const kill = require('./kill');
const workerScript = require('./worker');

const { pool } = ctx;

/**
 * Spawn a new worker
 *
 * @param {Number} [id] Worker ID
 *
 * @return {Promise}
 */
const spawnWorker = async (id = null) => {
  id = id || ctx.uuid();
  const worker = new Worker(workerScript, { eval: true });

  await Promise.race([
    // Error handler
    new Promise((resolve, reject) =>
      worker.on('error', async (error) => {
        reject();
        ctx.errorLogger(error);

        try {
          await kill(id);
        } catch (e) {
          ctx.errorLogger(e);
        }
      })),

    // Online event
    new Promise(resolve => worker.once('online', resolve))
  ]);

  // Listen for the job response
  await new Promise(resolve => {
    worker.on('message', (resp) => {
      if (resp.type === "start") return resolve();

      const { workerId, jobId, error, result } = resp;
      const poolWorker = pool.get(workerId);
      if (!poolWorker) return;
      resp.worker = poolWorker.worker;
      const { jobs } = poolWorker;
      const job = jobs.get(jobId);
      if (!job) return;
      jobs.delete(jobId);

      const ctx = {
        workerId: resp.workerId,
        jobId: resp.jobId,
        threadId: resp.threadId
      };

      if (error) {
        job.onDoneDeferred.reject({ ...ctx, ...error });
      } else {
        job.onDoneDeferred.resolve({ ...ctx, result });
      }
    });

    // Run the thread start job, if specified
    if (!ctx.onThreadStart) return resolve();

    try {
      worker.postMessage({
        type: "start",
        workerId: id,
        jobId: ctx.uuid(),
        method: ctx.onThreadStart.toString()
      });
    } catch (err) {
      worker.terminate();
      worker.removeAllListeners();
      throw err;
    }
  });

  // Mark the worker as ready
  pool.set(id, {
    id,
    worker,
    jobs: new Map()
  });
};

module.exports = spawnWorker;
