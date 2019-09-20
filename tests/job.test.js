const start = require('../lib/start');
const free = require('../lib/free');
const job = require('../lib/job');

beforeEach(start);
afterEach(free);

test('should execute the job matching the result', async () => {
  const worker = await job(() => ("Hello world"));
  const { result } = await worker.onDone;
  expect(result).toMatch("Hello world");
});

test('should execute the job and catch the error', async () => {
  try {
    const worker = await job(() => { throw new Error("test"); });
    await worker.onDone;
  } catch (e) {
    expect(e.message).toMatch("test");
  }
});

test('should pass data the job', async () => {
  const worker = await job(({ data }) => (data.hello), { data: { hello: "world" } })
  const { result } = await worker.onDone;
  expect(result).toMatch("world");
});
