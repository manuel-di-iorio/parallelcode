const start = require('../lib/start');
const free = require('../lib/free');
const job = require('../lib/job');

beforeEach(start);
afterEach(free);

test('should execute the job matching the result', async () => {
  const ctx = await job(() => ("Hello world"));
  const { result } = await ctx.onDone;
  expect(result).toMatch("Hello world");
});

test('should execute the job and catch the error', async () => {
  try {
    const ctx = await job(() => { throw new Error("test"); });
    await ctx.onDone;
  } catch (e) {
    expect(e.message).toMatch("test");
  }
});

test('should pass data the job', async () => {
  const ctx = await job(({ data }) => (data.hello), { data: { hello: "world" } });
  const { result } = await ctx.onDone;
  expect(result).toMatch("world");
});

test('should pass props to the job and get it again from outside', async () => {
  const ctx = await job(() => (null), { props: { hello: "world" } });
  expect(ctx.job.props.hello).toMatch("world");

  const workerJob = ctx.worker.jobs.get(ctx.job.id);
  expect(workerJob.props.hello).toMatch("world");
});
