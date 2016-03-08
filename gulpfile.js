var gulp = require('gulp');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');

var paths = {
    css: [
        './www/css/main.css',
        './www/css/style.css',
        './www/css/calendar.css'
    ],
    js: [
        './www/lib/angular-animate/angular-animate.min.js',
        './www/lib/angular-resource/angular-resource.min.js',
        './www/lib/angular-sanitize/angular-sanitize.min.js',
        './www/lib/angular-ui-router/release/angular-ui-router.min.js',
        './www/lib/async/dist/async.min.js',
        './www/lib/ionic-timepicker/dist/ionic-timepicker.bundle.min.js',
        './www/lib/moment/min/moment.min.js',
        './www/lib/moment/locale/es.js',
        './www/lib/moment-timezone/moment-timezone.min.js',
        './www/lib/underscore/underscore-min.js',
        './www/js/**/*.js'
    ]
};

gulp.task('default', ['css', 'uglify']);

gulp.task('css', function (done) {
    var cssStream = gulp.src(paths.css);

    merge(cssStream)
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(concat('main.css'))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('./www/res/'))
        .on('end', done);
});

gulp.task('uglify', function (done) {
    gulp.src(paths.js)
        .pipe(concat('main.js'))
        .pipe(uglify({mangle: false}))
        .on('error', function (error) {
            console.log(error);
        })
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('www/res/'))
        .on('end', done);
});

gulp.task('watch', function () {
    gulp.watch(paths.sass, ['css']);
    gulp.watch(paths.css, ['css']);
    gulp.watch(paths.js, ['uglify']);
});