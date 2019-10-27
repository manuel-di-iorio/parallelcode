const start = require('../lib/start');
const free = require('../lib/free');
const job = require('../lib/job');

afterEach(free);

test('should run the thread start job before any other job', async () => {
  await start({
    onThreadStart: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      THREAD_STATE.test = "Hello world!";
      return "onThreadStart"
    }
  });

  const ctx = await job(() => (THREAD_STATE.test));
  const { result } = await ctx.onDone;
  expect(result).toMatch("Hello world!");
});
