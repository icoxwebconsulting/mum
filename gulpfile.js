var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./www/js/**/*.js']
};

gulp.task('default', ['concatjs']);

//gulp.task('sass', function(done) {
//  gulp.src('./scss/ionic.app.scss')
//    .pipe(sass())
//    .on('error', sass.logError)
//    .pipe(gulp.dest('./www/css/'))
//    .pipe(minifyCss({
//      keepSpecialComments: 0
//    }))
//    .pipe(rename({ extname: '.min.css' }))
//    .pipe(gulp.dest('./www/css/'))
//    .on('end', done);
//});

gulp.task('concatjs', function (done) {
  gulp.src(paths.js)
    .pipe(concat('main.js'))
    .on('error', function (error) {
      console.log(error);
    })
    .pipe(gulp.dest('www/res/'))
    .on('end', done);
});

gulp.task('watch', function() {
  //gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['concatjs']);
});
