'use strict';

const path = require('path');
const gulp = require('gulp');
const conf = require('./conf');
const browserSync = require('browser-sync');

const $ = require('gulp-load-plugins')();

function buildScripts() {
    return gulp.src(path.join(conf.paths.src, '/app/**/*.js'))
        // Optional Linting:
        // .pipe($.eslint())
        // .pipe($.eslint.format())
        .pipe($.size())
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')));
}

function scripts() {
    return buildScripts();
}

function scriptsReload() {
    return buildScripts().pipe(browserSync.stream());
}

gulp.task('scripts', scripts);
gulp.task('scripts-reload', scriptsReload);

// 👇 EXPORT for other files (like inject.js)
module.exports = {
    scripts,
    scriptsReload
};
