const path = require('path');
const gulp = require('gulp');
const conf = require('./conf');
const $ = require('gulp-load-plugins')();
const wiredep = require('wiredep').stream;
const _ = require('lodash');
const browserSync = require('browser-sync');
const gulpSass = require('gulp-sass')(require('sass'));


function buildStyles() {
  const sassOptions = { style: 'expanded' };

  const injectFiles = gulp.src([
    path.join(conf.paths.src, '/app/**/*.scss'),
  ], { read: false });

  const injectOptions = {
    transform: (filePath) => `@import "${filePath.replace(conf.paths.src + '/app/', '')}";`,
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false,
  };

  return gulp.src([
    path.join(conf.paths.src, '/app/index.scss'),
  ])
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sourcemaps.init())
    .pipe(gulpSass(sassOptions)).on('error', conf.errorHandler('Sass')) // FIXED
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
}

function styles() {
  return buildStyles();
}

function stylesReload() {
  return buildStyles().pipe(browserSync.stream());
}

exports.styles = styles;
exports.stylesReload = stylesReload;
