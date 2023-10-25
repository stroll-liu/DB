const gulp = require('gulp'),
      babel = require('gulp-babel'),
      browserify = require('browserify'),
      uglify = require('gulp-uglify'),
      sourcemaps = require('gulp-sourcemaps'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer'),
      runSequence = require('run-sequence');

gulp.task('babel-webdb', () => {
    return gulp.src('./src/**/*.js')
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(gulp.dest('./build/src'));
});

gulp.task('browserify-webdb', () => {
    return browserify('./build/src/index.js', {
        standalone: 'webdb'
    })
        .bundle()
        .pipe(source('webdb.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('/'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('babel-test', () => {
    return gulp.src('./test/**/*.js')
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(gulp.dest('./build/test'));
});

gulp.task('browserify-test', () => {
    return browserify('./build/test/index.js')
        .bundle()
        .pipe(source('webdb-test-suite.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', (cb) => {
    runSequence(...[
        'babel-webdb',
        'browserify-webdb',
        'babel-test',
        'browserify-test'
    ], cb);
});

gulp.task('default', ['build']);
