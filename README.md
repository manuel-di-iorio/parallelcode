# Parallel Code

Execute code in [worker threads](https://nodejs.org/api/worker_threads.html) with a [thread pool](https://en.wikipedia.org/wiki/Thread_pool). A set of threads are spawned at the start and respawned if killed, ensuring fast execution times. New jobs are queued and immediately executed in the first available worker, then the worker is moved to the end of the pool, to distribuite work load.

## Features

- A worker can execute multiple jobs in parallel in the same thread.
- Queue scheduling is batched through tick intervals. This optimizes the call-stack size and CPU usage, also with many short-living tasks.
- Ability to kill specific workers.
- Data serialization is done natively from Node.js
- The job() method returns the worker that executed the job, which can then be used to get the job result.

---

## Example

```javascript
const { start, job } = require('parallelcode');

(async () => {
  await start();
  
  const worker = await job(async ({ data }) => {
    return `Hello ${data.text}!`;
  }, {
    data: { text: "world" }
  });

  const { result } = await worker.onDone;
  console.log(result); // Hello world!
})();
```

## API

```javascript
start([options = {}]): Promise
```

Initialize the thread pool

---

```javascript
job(method: Function, config: Object): Promise
```

Enqueue a function that will be executed in a thread.

The config may have a data object, that will be passed to the function. Data is natively serialized, according to the [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

Events:
  - **start -> (worker)**

    Emitted when a worker picks up a job.
    
  - **done -> (result, context)**
  
    Emitted when the job has finished its execution. Context is an object containing worker info.

  - **error -> (err, context)**

    Emitted on job errors or when the worker has been killed

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
