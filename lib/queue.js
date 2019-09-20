const queue = [];

const queueHandler = {
  /**
   * Enqueue a job into the queue
   *
   * @param {Object} job
   */
  push(job) {
    queue.push({
      id: job.id,
      method: job.method,
      data: job.config.data,
      onStart: job.onStart
    });
  },

  /**
   * Shift the first job from the queue
   *
   * @return {Object}
   */
  shift() {
    return queue.shift();
  },

  /**
   * Get the queue size
   *
   * @return {Number}
   */
  size() {
    return queue.length;
  },

  /**
   * Clear the queue
   */
  clear() {
    queue.length = 0;
  }
};

module.exports = queueHandler;
