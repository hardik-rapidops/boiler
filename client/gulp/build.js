'use strict';

const path = require('path');
const gulp = require('gulp');
const conf = require('./conf');
const { inject } = require('./inject');

const terser = require('gulp-terser');

const $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

const partials = () => {
    return gulp.src([
        path.join(conf.paths.src, '/app/**/*.html'),
        path.join(conf.paths.tmp, '/serve/app/**/*.html')
    ])
        .pipe($.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            sortAttributes: true,
            sortClassName: true,
            useShortDoctype: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: 'harsco-pk',
            root: 'app'
        }))
        .pipe(gulp.dest(conf.paths.tmp + '/partials/'));
};

const html = () => {
    const partialsInjectFile = gulp.src(path.join(conf.paths.tmp, '/partials/templateCacheHtml.js'), { read: false });
    const partialsInjectOptions = {
        starttag: '<!-- inject:partials -->',
        ignorePath: path.join(conf.paths.tmp, '/partials'),
        addRootSlash: false
    };

    const cssFilter = $.filter('**/*.css', { restore: true });
    const jsFilter = $.filter('**/*.js', { restore: true });
    const htmlFilter = $.filter('*.html', { restore: true });

    return gulp.src(path.join(conf.paths.tmp, '/serve/*.html'))
        .pipe($.inject(partialsInjectFile, partialsInjectOptions))
        .pipe($.useref())
        .pipe(jsFilter)
        .pipe($.sourcemaps.init())
        .pipe($.ngAnnotate())
        .pipe(terser({
            mangle: false,
            compress: { drop_console: false },
            format: { comments: false }
        })).on('error', conf.errorHandler('Terser'))
        .pipe($.rev())
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe($.sourcemaps.init())
        .pipe($.cleanCss())
        .pipe($.rev())
        .pipe(cssFilter.restore)
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            sortAttributes: true,
            sortClassName: true,
            useShortDoctype: true
        }))
        .pipe(htmlFilter.restore)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
        .pipe($.size({
            title: path.join(conf.paths.dist, '/'),
            showFiles: true
        }));
};

const fonts = () => {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts/')));
};

const other = () => {
    const fileFilter = $.filter(file => file.stat.isFile());

    return gulp.src([
        path.join(conf.paths.src, '/**/*'),
        path.join('!' + conf.paths.src, '/**/*.{html,css,js,scss}')
    ])
        .pipe(fileFilter)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
};

const clean = () => {
    return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
};

const build = gulp.series(partials, inject, html, fonts, other);

// Register tasks
exports.partials = partials;
exports.html = html;
exports.fonts = fonts;
exports.other = other;
exports.clean = clean;
exports.build = build;
