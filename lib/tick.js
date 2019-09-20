const ctx = require('./ctx');
const spawn = require('./spawn');

const { pool } = ctx;

/**
 * Handle the jobs execution and self recovery
 *
 * @return {Promise}
 */
const tick = async () => {
  // Stop the tick if the queue is empty
  let queueSize;
  try {
    queueSize = await ctx.queueHandler.size();
  } catch (e) {
    ctx.errorLogger(e);
  }

  if (queueSize) {
    const totalWorkers = Array(ctx.workersCount * ctx.concurrentJobs);

    for (const i of totalWorkers) { // eslint-disable-line no-unused-vars
      let stopTick = false;

      for (const [workerId, poolWorker] of pool) {
        const { worker, jobs } = poolWorker;

        // Check if the worker has been killed to spawn another
        try {
          if (!worker) await spawn(workerId);
        } catch (err) {
          ctx.errorLogger(err);
          continue;
        }

        // Check if this worker is available
        if (!worker || jobs.size >= ctx.concurrentJobs) {
          continue;
        }

        // Execute the job
        let job;
        try {
          job = await ctx.queueHandler.shift();
        } catch (e) {
          ctx.errorLogger(e);
        }

        if (!job) {
          // Stop the tick if there are no jobs left
          stopTick = true;
          break;
        }

        // Mark this job as being executed from the current worker
        jobs.set(job.id, job);

        // Move the worker to the end of the pool to distribuite work load
        pool.delete(workerId);
        pool.set(workerId, poolWorker);

        // Emit the starting event
        let onDoneDeferred;
        const onDone = new Promise((resolve, reject) => {
          onDoneDeferred = { resolve, reject };
        });

        job.onDoneDeferred = onDoneDeferred;
        job.onStart.resolve({ ...poolWorker, onDone });

        // Post the message to the worker thread
        try {
          worker.postMessage({
            workerId,
            jobId: job.id,
            method: job.method.toString(),
            data: job.data
          });
        } catch (err) {
          ctx.errorLogger(err);

          // In case of message error, requeue the job
          try {
            await ctx.queueHandler.push(job);
          } catch (e) {
            ctx.errorLogger(e);
          }

          continue;
        }
      }

      if (stopTick) break;
    }
  }

  ctx.tickInterval = setTimeout(tick, ctx.tickIntervalTime);
};

module.exports = tick;
