# Parallel Code

Execute code in [worker threads](https://nodejs.org/api/worker_threads.html) with a [thread pool](https://en.wikipedia.org/wiki/Thread_pool). A set of threads are spawned at the start and respawned if killed, ensuring fast execution times. New jobs are queued and immediately executed in the first available worker, then the worker is moved to the end of the pool, to distribuite work load.

## Features

- A worker can execute multiple jobs in parallel in the same thread. Async is supported
- Queue scheduling is batched through tick intervals. This optimizes the call-stack size and CPU usage, also with many short-living tasks.
- Ability to kill specific workers.
- Data serialization is done natively from Node.js
- Can execute a starting function to persist things like database connection or initial state. This is executed once inside the threads before any other jobs.

---

## Example

```javascript
const { start, job } = require('parallelcode');

(async () => {
  await start();
  
  const ctx = await job(async ({ data }) => {
    return `Hello ${data.text}!`;
  }, {
    data: { text: "world" }
  });

  const { result } = await ctx.onDone;
  console.log(result); // Hello world!
})();
```

## Installation

```bash
npm install parallelcode
```

## API

```javascript
start([options: Object]): Promise
```

Initialize the thread pool.

Options:
 - `workers` = Number of workers to spawn (defaults to CPUs number)

 - `concurrentJobs` = Number of jobs that a worker can execute in parallel (defaults to 10)

- `errorLogger` = Called when an error is occured for logging purposes (by default, console.error is used)

- `tickIntervalTime` = Time in ms between every tick (defaults to 100)

- `onThreadStart` = Job function to execute once inside the thread when it just spawned

---

```javascript
job(method: Function, config: Object): Promise<Object>
```

Enqueue a function that will be executed in a thread.


Config options:

  - `data` = Object that will be passed to the function executed inside the worker. Data is natively serialized, according to the [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

  - `props` = Anything here will be stored into the job object. This will not be passed to the worker.

Returned object has the `job` and `worker` data and the `onDone` promise.

---

```javascript
kill(workerId): Promise
```

Kill a specific worker

---

```javascript
free(): Promise
```
Kill all workers and free the pool memory

---

```javascript
pool: Map
```

Map variable to handle individual workers

---

## Tests

Run the tests suite with
```bash
$ npm test
```
