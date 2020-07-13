const { series, src, dest, watch } = require('gulp');
const nunjucksRender = require("gulp-nunjucks-render");
const browserSync = require("browser-sync");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const del = require('del');
const cache = require("gulp-cache");
const data = require('gulp-data'); // This plugin calls the JSON data file.
const fs = require('fs'); // Using for the JSON parsing...
let projects = null;

// Nunjucks HTML templating engine
function nunjucks(done) {
	return src('src/pages/**/*.njk')
		.pipe(data(projects = function () { return JSON.parse(fs.readFileSync('src/public/assets/data/db-portfolio.json')) }))
		.pipe(nunjucksRender({ path: ['src/templates'] }))
		.pipe(dest('src/public'))
	done()
}

// Sass compiler
function sassify(done) {
	return src('src/public/assets/sass/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'expanded' })).on('error', function swallowError(error) {
			console.log(error.toString());
			this.emit('end');
		})
		.pipe(sourcemaps.write())
		.pipe(dest('src/public/assets/css'))
		//.pipe(del('src/public/assets/sass/**/*.css'))
		.pipe(browserSync.reload({ stream: true }))
	done()
}
  
function browser_sync(done) {
	browserSync.init({
		watch: true,
		server: { baseDir: 'src/public' },
		open: false,
		port: 5000
	})
	done()
}

function html() {
return src('src/public/*.html')
	.pipe(dest('dist'))
}

function images() {
return src('src/public/assets/images/**/*.+(png|jpg|gif|svg)')
	.pipe(dest('dist/assets/images'))
}

function css() {
return src('src/public/assets/css/**/*.css')
	.pipe(dest('dist/assets/css/'))
}

// Deletes the dist folder
function clean_dist() {
	return del('./dist');
}

// Cleans the cache
function clear_cache(done) {
	return cache.clearAll(done)
}

// Adds CNAME to dist
function add_CNAME(){
	return src('src/CNAME')
	.pipe(dest('dist'));
}

function watch_files(done) {
watch('src/**/*.njk', nunjucks)
watch('src/**/*.json', nunjucks)
watch('src/**/*.scss', sassify)
watch('src/**/*.html', browserSync.reload)
done()
}

exports.start = series(clear_cache, browser_sync, sassify, nunjucks, watch_files);
exports.build = series(clean_dist, sassify, css, images, html);