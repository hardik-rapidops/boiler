'use strict';

const path = require('path');
const gulp = require('gulp');
const conf = require('./conf');
const browserSync = require('browser-sync');

const { inject } = require('./inject');
const { stylesReload } = require('./styles');
const { scriptsReload } = require('./scripts');

function isOnlyChange(event) {
  return event.type === 'changed';
}

function watch(done) {
  gulp.watch([path.join(conf.paths.src, '/*.html'), 'bower.json'], gulp.series(inject));

  gulp.watch([
    path.join(conf.paths.src, '/app/**/*.css'),
    path.join(conf.paths.src, '/app/**/*.scss')
  ]).on('change', function (event) {
    if (isOnlyChange(event)) {
      stylesReload();
    } else {
      inject();
    }
  });

  gulp.watch(path.join(conf.paths.src, '/app/**/*.js'))
    .on('change', function (event) {
      if (isOnlyChange(event)) {
        scriptsReload();
      } else {
        inject();
      }
    });

  gulp.watch([
    path.join(conf.paths.src, '/app/**/*.json'),
    path.join(conf.paths.src, '/app/**/*.html')
  ]).on('change', browserSync.reload);

  // ✅ Notify Gulp that the watch task is done setting up
  done();
}

// Export as Gulp 4-compatible task
exports.watch = watch;
