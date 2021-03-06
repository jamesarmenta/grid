const gulp = require('gulp'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat'),
  strip = require('gulp-strip-comments'),
  pug = require('pug'),
  gulpPug = require('gulp-pug'),
  browserSync = require('browser-sync'),
  livereload = require('gulp-livereload'),
  mocha = require('gulp-mocha'),
  nodemon = require('gulp-nodemon'),
  uglify = require('gulp-uglify-es').default,
  babel = require('babel-core/register'),
  webpack = require('webpack'),
  rename = require("gulp-rename"),
  path = require('path'),
  gutil = require('gulp-util'),
  reload = browserSync.reload;

const ignoreModules = '!./node_modules/**';

gulp.task('default', ['sync'], function() {
  gulp.watch(['./src/views/*.pug', ], ['pug', reload]);
  gulp.watch(['./src/scss/*.scss', ignoreModules], ['scss', reload]);
  gulp.watch(['./src/**/*.js', ignoreModules], ['js']).on('end', reload);
  gulp.watch(['./**/*.test.js', ignoreModules], ['js', 'test']).on('end', reload);
  // gulp.watch('./public/*', reload)
});

// BUILD
gulp.task('build', ['pug', 'scss', 'js', 'server'], function() {});

// NODEMON
gulp.task('nodemon', ['pug', 'scss', 'js', 'test', 'server'], function(cb) {
  var called = false;
  return nodemon({
      script: './dist/index.babel.js',
      ignore: [
        './src/views/',
        './src/scss/',
        './dist/',
        '*.test.js',
        'gulpfile.js',
        'node_modules/'
      ]
    })
    .on('start', function() {
      if (!called) {
        called = true;
        cb();
      }
    })
    .on('restart', function() {
      setTimeout(function() {
        reload({ stream: false });
      }, 1000);
    });
});


// SYNC
gulp.task('sync', ['nodemon'], function() {
  browserSync({
    proxy: "localhost:8080", // local node app address
    port: 5000, // use *different* port than above
    notify: true
  });
});

// TEST
gulp.task('test', function() {
  return gulp.src(['./**/*.test.js', ignoreModules], { read: false })
    // `gulp-mocha` needs filepaths so you can't have any plugins before it 
    .pipe(mocha({ reporter: 'min', compilers: 'js:babel-core/register' }))
    .on('error', function() { this.emit('end') });
});
// FILE TYPES

//SASS
gulp.task('scss', function() {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('main.css'))
    .pipe(gulp.dest('./dist/public/css'));
});

// PUG
gulp.task('pug', function() {
  return gulp.src(['./src/views/*.pug', ignoreModules])
    // .pipe(gulpPug({
    //     pug: pug,
    //     pretty: true
    // }))
    .pipe(gulp.dest('./dist/public/views/'));
});


// JAVSCRIPT
gulp.task('js', function() {
  var webpackConfig = {
    entry: path.resolve(__dirname, 'src/js/index.js'),
    output: {
      path: path.join(__dirname, 'dist/public'),
      filename: 'bundle.js',
    },
  }
  var myConfig = Object.create(webpackConfig);

  // run webpack
  webpack(myConfig, function(err, stats) {
    if (err) throw new gutil.PluginError('webpack', err);
    // gutil.log('[webpack]', stats.toString({
    //   colors: true,
    //   progress: false
    // }));
    // 
    gulp.src('dist/public/bundle.js')
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('dist/public/'));
  });
});

gulp.task('server', function() {
  // SERVER
  gulp.src(['./src/index.babel.js', './src/server.js'])
    .pipe(gulp.dest('./dist/'));

  gulp.src('./src/common/*')
    .pipe(gulp.dest('./dist/common/'));

  gulp.src('./src/config/*')
    .pipe(gulp.dest('./dist/config/'));
})