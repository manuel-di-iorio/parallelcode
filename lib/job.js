const ctx = require('./ctx');

/**
 * Enqueue a job
 *
 * @param {Function} method
 * @param {Object} [config]
 * @param {Object} [config.data] Job data
 *
 * @return {Promise}
 */
const job = (method, config = {}) => {
  config = config || {};
  config.data = config.data || {};

  return new Promise((resolve, reject) => {
    ctx.queueHandler.push({
      id: ctx.uuid(),
      method,
      config,
      onStart: { resolve, reject }
    });
  });
};

module.exports = job;
