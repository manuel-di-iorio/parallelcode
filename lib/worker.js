const worker = `
const { parentPort, threadId } = require('worker_threads');

parentPort.on('message', async (job) => {
  let result;
  let error;

  try {
    result = await eval(job.method)({ ...job, method: null });
  } catch (e) {
    error = {
      name: e.name,
      code: e.code,
      message: e.message,
      stack: e.stack
    };
  }
  
  try {
    parentPort.postMessage({
      workerId: job.workerId,
      jobId: job.jobId,
      threadId,
      result,
      error
    });
  } catch (err) {
    console.error(err);
  }
});  
`;

module.exports = worker;
