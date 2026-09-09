const gulp = require('gulp');
const fs = require('fs');
const path = require('path');


// Auto-load other gulp files
fs.readdirSync(path.join(__dirname, 'gulp')).forEach(function(file) {
  if (file.match(/\.js$/)) {
    require('./gulp/' + file);
  }
});

// Explicitly register tasks from module.exports (Gulp 4 style)
const { clean } = require('./gulp/clean');
const { build } = require('./gulp/build');
const { watch } = require('./gulp/watch');
const { serveTask, serveDistTask, serveE2ETask, serveE2EDistTask } = require('./gulp/server');
const { inject } = require('./gulp/inject');

gulp.task('clean', clean);
gulp.task('build', build);
gulp.task('watch', watch);
gulp.task('serve', gulp.series(watch, serveTask));
gulp.task('serve:dist', gulp.series('build', serveDistTask));
gulp.task('serve:e2e', gulp.series(inject, serveE2ETask));
gulp.task('serve:e2e-dist', gulp.series('build', serveE2EDistTask));

gulp.task('default', gulp.series('clean', 'build'));
