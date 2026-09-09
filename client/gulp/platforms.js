'use strict';

const gulp = require('gulp');
const path = require('path');
const source = require('vinyl-source-stream');
const insert = require('gulp-insert');
const rename = require('gulp-rename');
const browserify = require('browserify');
const fs = require('fs');

const version = '/*cordova */\n';
const platformsPath = path.resolve(__dirname, '../platforms');

// Dynamically read all supported platforms from `../platforms/`
function getSupportedPlatforms() {
    try {
        return fs.readdirSync(platformsPath).filter(file => {
            return fs.existsSync(path.join(platformsPath, file, 'platform_www', 'cordova.js'));
        });
    } catch (err) {
        console.error('Failed to read platforms:', err);
        return [];
    }
}

function buildCordovaJs(platform) {
    const cordovaJsPath = path.join(platformsPath, platform, 'platform_www', 'cordova.js');

    return browserify(cordovaJsPath)
        .bundle()
        .pipe(source('cordova.js'))
        .pipe(insert.prepend(version))
        .pipe(rename(`cordova-${platform}.js`))
        .pipe(gulp.dest('./'));
}

function platformsTask(done) {
    const platforms = getSupportedPlatforms();

    if (platforms.length === 0) {
        console.warn('No supported platforms found in ../platforms/');
        return done();
    }

    const tasks = platforms.map(platform => buildCordovaJs(platform));
    return require('merge-stream')(...tasks); // Use merge-stream to handle parallel streams
}

gulp.task('platforms', platformsTask);
