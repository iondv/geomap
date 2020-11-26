const merge = require('merge');

module.exports = merge(
  require('./web-errors'),
  require('./lib')
);
