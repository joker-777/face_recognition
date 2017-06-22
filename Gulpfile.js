var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	livereload = require('gulp-livereload'),
	connect = require('gulp-connect'),
	lr = require('tiny-lr'),
	server = lr();

// Server - listed on localhost:8080
gulp.task('webserver', function() {
  connect.server();
});

gulp.task('styles', function() {
  return gulp.src('sass/styles.scss')
	.pipe(sass({ style: 'expanded' }))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	.pipe(gulp.dest('css'))
    .pipe(livereload())
	.pipe(notify({ message: 'Styles task complete' }));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
	return gulp.src('js/*.js')
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist'))
		.pipe(rename('all.min.js'))
		.pipe(gulp.dest('dist'))
        .pipe(livereload());
});

// Images
gulp.task('images', function() {
  return gulp.src('img/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(livereload())
    .pipe(notify({ message: 'Images task complete' }));
});

// Watch
gulp.task('watch', function() {

  // Create LiveReload server
  livereload.listen();

  // Watch .scss files
  gulp.watch('sass/**/*.scss', ['styles']);

  // Watch .js files
  gulp.watch('js/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('img/**/*', ['images']);

  // // Watch any files in dist/, reload on change
  // gulp.watch(['css#<{(|*','js#<{(|*','img#<{(|*','*.html']).on('change', function(file) {
	// server.changed(file.path);
  // });

});

gulp.task('default', ['webserver','styles', 'scripts', 'watch']);
