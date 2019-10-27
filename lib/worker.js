const worker = `
const { parentPort, threadId } = require('worker_threads');

const THREAD_STATE = {};

parentPort.on('message', async (job) => {
  let THREAD_JOB_RESULT;
  let THREAD_JOB_ERROR;

  try {
    THREAD_JOB_RESULT = await eval(job.method)({ ...job, method: null });
  } catch (e) {
    THREAD_JOB_ERROR = {
      name: e.name,
      code: e.code,
      message: e.message,
      stack: e.stack
    };
  }
  
  try {
    parentPort.postMessage({
      type: job.type,
      workerId: job.workerId,
      jobId: job.jobId,
      threadId,
      result: THREAD_JOB_RESULT,
      error: THREAD_JOB_ERROR
    });
  } catch (err) {
    console.error(err);
  }
});  
`;

module.exports = worker;
