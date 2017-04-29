const bower = require('bower')
const gulp = require('gulp')
const gutil = require('gulp-util')
const mincss = require('gulp-minify-css')
const rename = require('gulp-rename')
const sass = require('gulp-sass')
const shell = require('shelljs')

const stylePaths = ['./scss/**/*.scss']

gulp.task('default', ['sass'])

gulp.task('check-git', done => shell.which('git') ? done() : onGitError())

gulp.task('install', ['check-git'], () => bower.commands.install()
  .on('log', data => gutil.log('bower', gutil.colors.cyan(data.id), data.message)))

gulp.task('sass', done => gulp
  .src(stylePaths)
  .pipe(sass())
  .on('error', sass.logError)
  .pipe(gulp.dest('./www/css/'))
  .pipe(mincss({ keepSpecialComments: 0 }))
  .pipe(rename({ extname: '.min.css' }))
  .pipe(gulp.dest('./www/css/'))
  .on('end', done))

gulp.task('watch', () => gulp.watch(stylePaths, ['sass']))

function onGitError () {
  console.log(`${gutil.colors.red('Git is not installed.')}
    Git, the version control system, is required to download Ionic.
    Download git here:', ${gutil.colors.cyan('http://git-scm.com/downloads')}.
    Once git is installed, run '${gutil.colors.cyan('gulp install')}' again.`)
  process.exit(1)
}
