var gulp     = require('gulp'),
    nodeunit = require('gulp-nodeunit'),
    jsdoc    = require('gulp-jsdoc'),
    jshint   = require('gulp-jshint'),
    fs       = require('fs'),
    pkg      = JSON.parse(fs.readFileSync('./package.json'));

gulp.task('default', ['docs','test'], function () {
});

gulp.task('test', function() {
  gulp.src('test/*.test.js')
    .pipe(nodeunit({}));

  gulp.src(['index.js', 'lib/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('docs', function() {
  gulp.src(['index.js', 'lib/**/*.js', 'README.md'])
    .pipe(jsdoc(
      './docs',
      {
        path            : 'ink-docstrap',
        systemName      : pkg.name,
        footer          : pkg.name,
        copyright       : pkg.author,
        navType         : 'vertical',
        theme           : 'flatly',
        linenums        : true,
        collapseSymbols : false,
        inverseNav      : false
      },
      {
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        licenses: [pkg.license]
      }
    ));
});
