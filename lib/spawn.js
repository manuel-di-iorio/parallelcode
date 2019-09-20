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

  pool.set(id, {
    id,
    worker,
    jobs: new Map()
  });

  // Add the error handler
  worker.on('error', async (error) => {
    ctx.errorLogger(error);

    try {
      await kill(id);
    } catch (e) {
      ctx.errorLogger(e);
    }
  });

  await new Promise(resolve => worker.once('online', resolve));

  // Listen for the job response
  worker.on('message', (resp) => {
    const { workerId, jobId, error, result } = resp;
    const poolWorker = pool.get(workerId);
    resp.worker = poolWorker.worker;
    const { jobs } = poolWorker;
    const job = jobs.get(jobId);
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
};

module.exports = spawnWorker;
