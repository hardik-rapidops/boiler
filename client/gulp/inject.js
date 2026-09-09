'use strict';

const path = require('path');
const gulp = require('gulp');
const conf = require('./conf');

const $ = require('gulp-load-plugins')();
const wiredep = require('wiredep').stream;
const _ = require('lodash');
const browserSync = require('browser-sync').create();

const { scripts } = require('./scripts');
const { styles } = require('./styles');

function injectTask() {
    const injectStyles = gulp.src([
        path.join(conf.paths.tmp, '/serve/app/**/*.css'),
        '!' + path.join(conf.paths.tmp, '/serve/app/vendor.css')
    ], { read: false });

    const injectScripts = gulp.src([
        path.join(conf.paths.src, '/app/**/*.module.js'),
        path.join(conf.paths.src, '/app/**/*.js'),
        '!' + path.join(conf.paths.src, '/app/**/*.spec.js'),
        '!' + path.join(conf.paths.src, '/app/**/*.mock.js')
    ])
        .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'));

    const injectOptions = {
        ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
        addRootSlash: false
    };

    return gulp.src(path.join(conf.paths.src, '/*.html'))
        .pipe($.inject(injectStyles, injectOptions))
        .pipe($.inject(injectScripts, injectOptions))
        .pipe(wiredep(_.extend({}, conf.wiredep)))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));
}

function injectReloadTask(done) {
    browserSync.reload();
    done();
}

exports.inject = gulp.series(scripts, styles, injectTask);
exports.injectReload = gulp.series(exports.inject, injectReloadTask);
