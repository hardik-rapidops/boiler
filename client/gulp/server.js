const { series, parallel } = require('gulp');
const gulp = require('gulp');
const path = require('path');
const conf = require('./conf');
const browserSync = require('browser-sync').create();
const browserSyncSpa = require('browser-sync-spa');
const proxyMiddleware = require('http-proxy-middleware');
const util = require('util');

// Register browserSync SPA plugin
browserSync.use(browserSyncSpa({ selector: '[ng-app]' }));

function browserSyncInit(baseDir, browser) {
  browser = browser === undefined ? 'default' : browser;

  let routes = null;
  if (baseDir === conf.paths.src || (Array.isArray(baseDir) && baseDir.includes(conf.paths.src))) {
    routes = {
      '/bower_components': 'bower_components',
    };
  }

  const server = {
    baseDir,
    routes,
    middleware: proxyMiddleware('/api', {
      target: 'http://localhost:3030',
      changeOrigin: true,
    }),
  };

  browserSync.init({
    startPath: '/',
    server,
    browser,
  });
}

// Define serve tasks correctly
// function serveTask(done) {
//   browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src]);
//   done();
// }
function serveTask(done) {
    console.log('[serveTask] Starting BrowserSync...');
    browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src]);
    console.log('[serveTask] BrowserSync started.');
    done();
  }

function serveDistTask(done) {
  browserSyncInit(conf.paths.dist);
  done();
}

function serveE2ETask(done) {
  browserSyncInit([path.join(conf.paths.tmp, '/serve'), conf.paths.src], []);
  done();
}

function serveE2EDistTask(done) {
  browserSyncInit(conf.paths.dist, []);
  done();
}

// Register tasks properly in Gulp 4
// gulp.task('serve', series('watch', serveTask));
// gulp.task('serve:dist', series('build', serveDistTask));
// gulp.task('serve:e2e', series('inject', serveE2ETask));
// gulp.task('serve:e2e-dist', series('build', serveE2EDistTask));

module.exports = {
    serveTask,
    serveDistTask,
    serveE2ETask,
    serveE2EDistTask,
  };
