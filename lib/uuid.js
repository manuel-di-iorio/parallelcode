const crypto = require('crypto');

/**
 * Generate an UUID
 *
 * @return {String}
 */
const uuid = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
  .replace(/[018]/g, b => (b ^ crypto.randomBytes(1)[0] % 16 >> b / 4).toString(16));

module.exports = uuid;
