const del = require('del');

function clean() {
  return del(['.tmp', 'dist']);
}

module.exports = clean;
