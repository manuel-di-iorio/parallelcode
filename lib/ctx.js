const context = {
  // Workers pool map
  pool: new Map(),

  // Queue handler
  queueHandler: null,

  // Number of spawned workers
  workersCount: null,

  // Tick interval variable
  tickInterval: null,

  // Tick interval limit
  tickIntervalTime: null,

  // Number of concurrent jobs
  concurrentJobs: null,

  // Error logger method
  errorLogger: null,

  // UUID generator method
  uuid: null
};

module.exports = context;
