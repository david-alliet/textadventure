var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

//script paths
var srcFiles = 'src/*.js';
var destFolder = 'dist';

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('min', function() {
  return gulp.src(srcFiles)
    .pipe(concat('textadventure.js'))
    .pipe(gulp.dest(destFolder))
    .pipe(rename('textadventure.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(destFolder));
});
